import {
  ActivityEntityType,
  ApplicationStatusType,
  Prisma,
  type InternshipSeason,
  TimelineEventType,
} from "@prisma/client";
import sanitizeHtml from "sanitize-html";
import { db } from "@/lib/db";
import { applicationSchema } from "@/lib/validations/application";
import { detectDuplicates } from "@/lib/utils/duplicate";
import { createActivityLog, createTimelineEvent } from "@/lib/services/activity";
import { STATUS_LABELS } from "@/constants/app";

const applicationInclude = {
  interviews: true,
  tasks: true,
  timelineEvents: { orderBy: { occurredAt: "desc" as const } },
  activities: { orderBy: { createdAt: "desc" as const }, take: 40 },
  reminders: true,
  tags: { include: { tag: true } },
  contacts: { include: { contact: true } },
  documents: { include: { document: true } },
  customStatus: true,
} satisfies Prisma.ApplicationInclude;

type DuplicateComparableApplication = {
  id: string;
  companyName: string;
  roleTitle: string;
  season: InternshipSeason | null;
  jobPostingUrl: string | null;
  applicationUrl: string | null;
};

export type ApplicationFilters = {
  includeArchived?: boolean;
  search?: string;
  statuses?: ApplicationStatusType[];
  priorities?: string[];
};

export type ApplicationListFilters = ApplicationFilters & {
  page?: number;
  pageSize?: number;
};

const applicationListSelect = {
  id: true,
  companyName: true,
  roleTitle: true,
  location: true,
  workMode: true,
  status: true,
  priority: true,
  deadline: true,
  appliedDate: true,
  updatedAt: true,
} satisfies Prisma.ApplicationSelect;

export type ApplicationListItem = Prisma.ApplicationGetPayload<{ select: typeof applicationListSelect }>;
export type ApplicationDetail = Prisma.ApplicationGetPayload<{ include: typeof applicationInclude }>;
export type KanbanApplicationItem = Prisma.ApplicationGetPayload<{
  select: {
    id: true;
    companyName: true;
    roleTitle: true;
    status: true;
    priority: true;
    deadline: true;
  };
}>;
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function buildApplicationWhere(userId: string, filters: ApplicationFilters): Prisma.ApplicationWhereInput {
  return {
    userId,
    archived: filters.includeArchived ? undefined : false,
    status: filters.statuses?.length ? { in: filters.statuses } : undefined,
    priority: filters.priorities?.length ? { in: filters.priorities as never[] } : undefined,
    OR: filters.search
      ? [
          { companyName: { contains: filters.search, mode: "insensitive" } },
          { roleTitle: { contains: filters.search, mode: "insensitive" } },
          { notes: { contains: filters.search, mode: "insensitive" } },
          { tags: { some: { tag: { name: { contains: filters.search, mode: "insensitive" } } } } },
          { contacts: { some: { contact: { name: { contains: filters.search, mode: "insensitive" } } } } },
        ]
      : undefined,
  };
}

export async function getApplications(userId: string, filters: ApplicationFilters = {}) {
  return db.application.findMany({
    where: buildApplicationWhere(userId, filters),
    include: applicationInclude,
    orderBy: [{ archived: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getApplicationsList(
  userId: string,
  filters: ApplicationListFilters = {},
): Promise<PaginatedResult<ApplicationListItem>> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 25));
  const where = buildApplicationWhere(userId, filters);
  const [total, items] = await Promise.all([
    db.application.count({ where }),
    db.application.findMany({
      where,
      select: applicationListSelect,
      orderBy: [{ archived: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getKanbanApplications(userId: string) {
  return db.application.findMany({
    where: { userId, archived: false },
    select: {
      id: true,
      companyName: true,
      roleTitle: true,
      status: true,
      priority: true,
      deadline: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getApplicationById(userId: string, id: string) {
  return db.application.findFirst({
    where: { id, userId },
    include: applicationInclude,
  });
}

export async function createApplication(userId: string, input: unknown) {
  const parsed = applicationSchema.parse(input);
  const existing = (await db.application.findMany({
    where: { userId },
    select: {
      id: true,
      companyName: true,
      roleTitle: true,
      season: true,
      jobPostingUrl: true,
      applicationUrl: true,
    },
  })) satisfies DuplicateComparableApplication[];
  const duplicates = detectDuplicates(existing, {
    companyName: parsed.companyName,
    roleTitle: parsed.roleTitle,
    season: parsed.season ?? null,
    jobPostingUrl: parsed.jobPostingUrl || null,
    applicationUrl: parsed.applicationUrl || null,
  });

  const created = await db.application.create({
    data: {
      userId,
      companyName: parsed.companyName,
      roleTitle: parsed.roleTitle,
      department: parsed.department,
      location: parsed.location,
      country: parsed.country,
      workMode: parsed.workMode,
      status: parsed.status,
      priority: parsed.priority,
      source: parsed.source,
      applicationUrl: parsed.applicationUrl || null,
      jobPostingUrl: parsed.jobPostingUrl || null,
      deadline: parsed.deadline ?? null,
      appliedDate: parsed.appliedDate ?? null,
      discoveredDate: parsed.discoveredDate ?? null,
      season: parsed.season ?? null,
      applicationYear: parsed.applicationYear ?? null,
      compensation: parsed.compensation,
      visaSponsorship: parsed.visaSponsorship ?? null,
      referralUsed: parsed.referralUsed,
      jobDescription: parsed.jobDescription ? sanitizeHtml(parsed.jobDescription, { allowedTags: [] }) : null,
      notes: parsed.notes ? sanitizeHtml(parsed.notes, { allowedTags: [] }) : null,
      archived: parsed.archived,
      tags: parsed.tagIds.length
        ? {
            createMany: {
              data: parsed.tagIds.map((tagId) => ({ tagId })),
              skipDuplicates: true,
            },
          }
        : undefined,
    },
    include: applicationInclude,
  });

  await createTimelineEvent({
    userId,
    applicationId: created.id,
    type: TimelineEventType.DISCOVERED,
    title: "Application created",
  });
  await createActivityLog({
    userId,
    applicationId: created.id,
    entityType: ActivityEntityType.APPLICATION,
    entityId: created.id,
    action: "created",
    newValue: created,
  });

  return { created, duplicates };
}

export async function updateApplication(userId: string, id: string, input: unknown) {
  const parsed = applicationSchema.partial().parse(input);
  const existing = await db.application.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Application not found");

  const updated = await db.application.update({
    where: { id },
    data: {
      companyName: parsed.companyName,
      roleTitle: parsed.roleTitle,
      department: parsed.department,
      location: parsed.location,
      country: parsed.country,
      workMode: parsed.workMode,
      status: parsed.status,
      priority: parsed.priority,
      source: parsed.source,
      applicationUrl: parsed.applicationUrl || undefined,
      jobPostingUrl: parsed.jobPostingUrl || undefined,
      deadline: parsed.deadline,
      appliedDate: parsed.appliedDate,
      discoveredDate: parsed.discoveredDate,
      season: parsed.season,
      applicationYear: parsed.applicationYear,
      compensation: parsed.compensation,
      visaSponsorship: parsed.visaSponsorship,
      referralUsed: parsed.referralUsed,
      jobDescription: parsed.jobDescription ? sanitizeHtml(parsed.jobDescription, { allowedTags: [] }) : undefined,
      notes: parsed.notes ? sanitizeHtml(parsed.notes, { allowedTags: [] }) : undefined,
      archived: parsed.archived,
      tags: parsed.tagIds
        ? {
            deleteMany: {},
            createMany: {
              data: parsed.tagIds.map((tagId) => ({ tagId })),
              skipDuplicates: true,
            },
          }
        : undefined,
    },
    include: applicationInclude,
  });

  await createActivityLog({
    userId,
    applicationId: id,
    entityType: ActivityEntityType.APPLICATION,
    entityId: id,
    action: "updated",
    oldValue: existing,
    newValue: updated,
  });
  await createTimelineEvent({
    userId,
    applicationId: id,
    type: TimelineEventType.NOTE_ADDED,
    title: "Application updated",
  });

  return updated;
}

export async function archiveApplication(userId: string, id: string) {
  const app = await db.application.findFirst({ where: { id, userId } });
  if (!app) throw new Error("Application not found");
  const archived = await db.application.update({
    where: { id },
    data: { archived: true, status: ApplicationStatusType.ARCHIVED },
  });
  await createTimelineEvent({
    userId,
    applicationId: id,
    type: TimelineEventType.STATUS_CHANGED,
    title: "Application archived",
  });
  await createActivityLog({
    userId,
    applicationId: id,
    entityType: ActivityEntityType.APPLICATION,
    entityId: id,
    action: "archived",
    oldValue: app.status,
    newValue: archived.status,
  });
  return archived;
}

export async function deleteApplication(userId: string, id: string) {
  const existing = await db.application.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Application not found");
  await db.application.delete({ where: { id } });
  return { id };
}

export async function changeApplicationStatus(
  userId: string,
  id: string,
  status: ApplicationStatusType,
  note?: string,
) {
  const app = await db.application.findFirst({ where: { id, userId } });
  if (!app) throw new Error("Application not found");

  const updated = await db.application.update({
    where: { id },
    data: { status },
  });

  await createTimelineEvent({
    userId,
    applicationId: id,
    type: TimelineEventType.STATUS_CHANGED,
    title: `Status changed: ${STATUS_LABELS[app.status]} to ${STATUS_LABELS[status]}`,
    description: note,
  });
  await createActivityLog({
    userId,
    applicationId: id,
    entityType: ActivityEntityType.STATUS,
    entityId: id,
    action: "status_changed",
    oldValue: app.status,
    newValue: status,
  });

  return updated;
}

export async function bulkUpdateApplications(
  userId: string,
  ids: string[],
  update: Partial<{ status: ApplicationStatusType; archived: boolean }>,
) {
  await db.application.updateMany({
    where: { id: { in: ids }, userId },
    data: update,
  });
  return { updatedCount: ids.length };
}

export async function exportJson(userId: string) {
  const applications = await getApplications(userId, { includeArchived: true });
  return JSON.stringify(applications, null, 2);
}
