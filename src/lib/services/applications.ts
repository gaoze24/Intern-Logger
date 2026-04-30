import {
  ActivityEntityType,
  ApplicationStatusType,
  Prisma,
  type Priority,
  type InternshipSeason,
  TimelineEventType,
} from "@prisma/client";
import sanitizeHtml from "sanitize-html";
import { db } from "@/lib/db";
import { applicationSchema } from "@/lib/validations/application";
import { detectDuplicates } from "@/lib/utils/duplicate";
import { createActivityLog, createTimelineEvent } from "@/lib/services/activity";
import { STATUS_LABELS } from "@/constants/app";
import { appError } from "@/lib/errors";

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
  tab?: ApplicationListTab;
  search?: string;
  statuses?: ApplicationStatusType[];
  priorities?: Priority[];
};

export type ApplicationListFilters = ApplicationFilters & {
  sort?: ApplicationSortKey;
  order?: ApplicationSortOrder;
  page?: number;
  pageSize?: number;
};

export const APPLICATION_LIST_TABS = ["active", "archived", "all"] as const;
export type ApplicationListTab = (typeof APPLICATION_LIST_TABS)[number];

export const APPLICATION_SORT_OPTIONS = {
  deadline: "deadline",
  appliedDate: "appliedDate",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  companyName: "companyName",
  roleTitle: "roleTitle",
  priority: "priority",
  status: "status",
} as const;

export type ApplicationSortKey = keyof typeof APPLICATION_SORT_OPTIONS;
export type ApplicationSortOrder = "asc" | "desc";

export const DEFAULT_APPLICATION_SORT: { sort: ApplicationSortKey; order: ApplicationSortOrder } = {
  sort: "updatedAt",
  order: "desc",
};

export function normalizeApplicationTab(value: string | undefined): ApplicationListTab {
  return APPLICATION_LIST_TABS.includes(value as ApplicationListTab) ? (value as ApplicationListTab) : "active";
}

export function normalizeApplicationSort(
  sort: string | undefined,
  order: string | undefined,
): { sort: ApplicationSortKey; order: ApplicationSortOrder } {
  const safeSort = sort && sort in APPLICATION_SORT_OPTIONS ? (sort as ApplicationSortKey) : DEFAULT_APPLICATION_SORT.sort;
  const safeOrder = order === "asc" || order === "desc" ? order : DEFAULT_APPLICATION_SORT.order;
  return { sort: safeSort, order: safeOrder };
}

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
  archived: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ApplicationSelect;

export type ApplicationListItem = Prisma.ApplicationGetPayload<{ select: typeof applicationListSelect }>;
export type ApplicationDetail = Prisma.ApplicationGetPayload<{ include: typeof applicationInclude }>;
export type KanbanApplicationItem = Prisma.ApplicationGetPayload<{
  select: {
    id: true;
    companyName: true;
    roleTitle: true;
    location: true;
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

export type ApplicationCounts = {
  active: number;
  archived: number;
  all: number;
};

function getArchiveWhere(tab: ApplicationListTab): Prisma.ApplicationWhereInput {
  if (tab === "archived") {
    return {
      OR: [{ archived: true }, { status: ApplicationStatusType.ARCHIVED }],
    };
  }

  if (tab === "all") {
    return {};
  }

  return {
    archived: false,
    status: { not: ApplicationStatusType.ARCHIVED },
  };
}

function buildApplicationWhere(userId: string, filters: ApplicationFilters): Prisma.ApplicationWhereInput {
  const tab = filters.tab ?? (filters.includeArchived ? "all" : "active");
  const searchWhere: Prisma.ApplicationWhereInput | undefined = filters.search
    ? {
        OR: [
          { companyName: { contains: filters.search, mode: "insensitive" } },
          { roleTitle: { contains: filters.search, mode: "insensitive" } },
          { notes: { contains: filters.search, mode: "insensitive" } },
          { tags: { some: { tag: { name: { contains: filters.search, mode: "insensitive" } } } } },
          { contacts: { some: { contact: { name: { contains: filters.search, mode: "insensitive" } } } } },
        ],
      }
    : undefined;

  return {
    userId,
    deletedAt: null,
    status: filters.statuses?.length ? { in: filters.statuses } : undefined,
    priority: filters.priorities?.length ? { in: filters.priorities } : undefined,
    AND: [getArchiveWhere(tab), ...(searchWhere ? [searchWhere] : [])],
  };
}

function buildApplicationWhereSql(userId: string, filters: ApplicationFilters) {
  const tab = filters.tab ?? (filters.includeArchived ? "all" : "active");
  const conditions: Prisma.Sql[] = [
    Prisma.sql`a."userId" = ${userId}`,
    Prisma.sql`a."deletedAt" IS NULL`,
  ];

  if (tab === "active") {
    conditions.push(Prisma.sql`a."archived" = false`);
    conditions.push(Prisma.sql`a."status"::text <> ${ApplicationStatusType.ARCHIVED}`);
  } else if (tab === "archived") {
    conditions.push(Prisma.sql`(a."archived" = true OR a."status"::text = ${ApplicationStatusType.ARCHIVED})`);
  }

  if (filters.statuses?.length) {
    conditions.push(Prisma.sql`a."status"::text IN (${Prisma.join(filters.statuses)})`);
  }

  if (filters.priorities?.length) {
    conditions.push(Prisma.sql`a."priority"::text IN (${Prisma.join(filters.priorities)})`);
  }

  if (filters.search) {
    const search = `%${filters.search}%`;
    conditions.push(Prisma.sql`(
      a."companyName" ILIKE ${search}
      OR a."roleTitle" ILIKE ${search}
      OR a."notes" ILIKE ${search}
      OR EXISTS (
        SELECT 1
        FROM "ApplicationTag" at
        JOIN "Tag" t ON t."id" = at."tagId"
        WHERE at."applicationId" = a."id" AND t."name" ILIKE ${search}
      )
      OR EXISTS (
        SELECT 1
        FROM "ApplicationContact" ac
        JOIN "Contact" c ON c."id" = ac."contactId"
        WHERE ac."applicationId" = a."id" AND c."name" ILIKE ${search}
      )
    )`);
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;
}

function getApplicationOrderSql(sort: ApplicationSortKey, order: ApplicationSortOrder) {
  const direction = order === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
  const textDirection = order === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;

  if (sort === "deadline") {
    return Prisma.sql`a."deadline" IS NULL ASC, a."deadline" ${direction}, a."updatedAt" DESC`;
  }

  if (sort === "appliedDate") {
    return Prisma.sql`a."appliedDate" IS NULL ASC, a."appliedDate" ${direction}, a."updatedAt" DESC`;
  }

  if (sort === "companyName") {
    return Prisma.sql`lower(a."companyName") ${textDirection}, a."updatedAt" DESC`;
  }

  if (sort === "roleTitle") {
    return Prisma.sql`lower(a."roleTitle") ${textDirection}, a."updatedAt" DESC`;
  }

  if (sort === "priority") {
    return Prisma.sql`CASE a."priority"::text
      WHEN 'DREAM' THEN 4
      WHEN 'HIGH' THEN 3
      WHEN 'MEDIUM' THEN 2
      WHEN 'LOW' THEN 1
      ELSE 0
    END ${direction}, a."updatedAt" DESC`;
  }

  if (sort === "status") {
    return Prisma.sql`CASE a."status"::text
      WHEN 'WISHLIST' THEN 1
      WHEN 'PREPARING' THEN 2
      WHEN 'APPLIED' THEN 3
      WHEN 'ONLINE_ASSESSMENT' THEN 4
      WHEN 'RECRUITER_SCREEN' THEN 5
      WHEN 'TECHNICAL_INTERVIEW' THEN 6
      WHEN 'BEHAVIORAL_INTERVIEW' THEN 7
      WHEN 'FINAL_ROUND' THEN 8
      WHEN 'OFFER' THEN 9
      WHEN 'REJECTED' THEN 10
      WHEN 'WITHDRAWN' THEN 11
      WHEN 'ARCHIVED' THEN 12
      ELSE 13
    END ${direction}, a."updatedAt" DESC`;
  }

  if (sort === "createdAt") {
    return Prisma.sql`a."createdAt" ${direction}, a."updatedAt" DESC`;
  }

  return Prisma.sql`a."updatedAt" ${direction}`;
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
  const { sort, order } = normalizeApplicationSort(filters.sort, filters.order);
  const where = buildApplicationWhere(userId, filters);
  const whereSql = buildApplicationWhereSql(userId, filters);
  const orderSql = getApplicationOrderSql(sort, order);
  const [total, idRows] = await Promise.all([
    db.application.count({ where }),
    db.$queryRaw<{ id: string }[]>`
      SELECT a."id"
      FROM "Application" a
      ${whereSql}
      ORDER BY ${orderSql}
      OFFSET ${(page - 1) * pageSize}
      LIMIT ${pageSize}
    `,
  ]);
  const ids = idRows.map((row) => row.id);
  const fetched = ids.length
    ? await db.application.findMany({
        where: { id: { in: ids }, userId, deletedAt: null },
        select: applicationListSelect,
      })
    : [];
  const byId = new Map(fetched.map((item) => [item.id, item]));
  const items = ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getApplicationCounts(userId: string, filters: Omit<ApplicationFilters, "tab" | "includeArchived"> = {}) {
  const [active, archived] = await Promise.all([
    db.application.count({ where: buildApplicationWhere(userId, { ...filters, tab: "active" }) }),
    db.application.count({ where: buildApplicationWhere(userId, { ...filters, tab: "archived" }) }),
  ]);

  return {
    active,
    archived,
    all: active + archived,
  } satisfies ApplicationCounts;
}

export async function getKanbanApplications(userId: string) {
  return db.application.findMany({
    where: { userId, archived: false, status: { not: ApplicationStatusType.ARCHIVED }, deletedAt: null },
    select: {
      id: true,
      companyName: true,
      roleTitle: true,
      location: true,
      status: true,
      priority: true,
      deadline: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getApplicationById(userId: string, id: string) {
  return db.application.findFirst({
    where: { id, userId, deletedAt: null },
    include: applicationInclude,
  });
}

export async function createApplication(userId: string, input: unknown) {
  const parsed = applicationSchema.parse(input);
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) throw appError("UNAUTHORIZED", "Please sign in to continue.", { status: 401 });

  const existing = (await db.application.findMany({
    where: { userId, deletedAt: null },
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
      archivedAt: parsed.archived ? new Date() : null,
      previousStatusBeforeArchive: parsed.archived ? parsed.status : null,
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
  const existing = await db.application.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw appError("NOT_FOUND", "This application no longer exists.", { status: 404 });

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
  const app = await db.application.findFirst({ where: { id, userId, deletedAt: null } });
  if (!app) throw appError("NOT_FOUND", "This application no longer exists.", { status: 404 });
  const archivedAt = new Date();
  const previousStatus =
    app.status === ApplicationStatusType.ARCHIVED
      ? app.previousStatusBeforeArchive
      : app.status;
  const archived = await db.application.update({
    where: { id },
    data: {
      archived: true,
      archivedAt,
      previousStatusBeforeArchive: previousStatus,
      status: ApplicationStatusType.ARCHIVED,
    },
  });
  await createTimelineEvent({
    userId,
    applicationId: id,
    type: TimelineEventType.STATUS_CHANGED,
    title: "Application archived",
    description: "Hidden from the active applications list.",
  });
  await createActivityLog({
    userId,
    applicationId: id,
    entityType: ActivityEntityType.APPLICATION,
    entityId: id,
    action: "archived",
    oldValue: { status: app.status, archived: app.archived, archivedAt: app.archivedAt },
    newValue: { status: archived.status, archived: archived.archived, archivedAt: archived.archivedAt },
  });
  return archived;
}

export async function restoreApplication(userId: string, id: string) {
  const app = await db.application.findFirst({ where: { id, userId, deletedAt: null } });
  if (!app) throw appError("NOT_FOUND", "This application no longer exists.", { status: 404 });

  const restoredStatus =
    app.status === ApplicationStatusType.ARCHIVED
      ? app.previousStatusBeforeArchive ?? ApplicationStatusType.APPLIED
      : app.status;

  const restored = await db.application.update({
    where: { id },
    data: {
      archived: false,
      archivedAt: null,
      previousStatusBeforeArchive: null,
      status: restoredStatus,
    },
  });

  await createTimelineEvent({
    userId,
    applicationId: id,
    type: TimelineEventType.STATUS_CHANGED,
    title: "Application restored",
    description: "Returned to the active applications list.",
  });
  await createActivityLog({
    userId,
    applicationId: id,
    entityType: ActivityEntityType.APPLICATION,
    entityId: id,
    action: "restored",
    oldValue: { status: app.status, archived: app.archived, archivedAt: app.archivedAt },
    newValue: { status: restored.status, archived: restored.archived, archivedAt: restored.archivedAt },
  });

  return restored;
}

export async function deleteApplication(userId: string, id: string) {
  const existing = await db.application.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw appError("NOT_FOUND", "This application no longer exists.", { status: 404 });
  const deletedAt = new Date();
  await db.$transaction([
    db.applicationContact.deleteMany({ where: { applicationId: id } }),
    db.applicationDocument.deleteMany({ where: { applicationId: id } }),
    db.timelineEvent.deleteMany({ where: { userId, applicationId: id } }),
    db.interview.deleteMany({ where: { userId, applicationId: id } }),
    db.task.updateMany({ where: { userId, applicationId: id }, data: { applicationId: null } }),
    db.reminder.updateMany({ where: { userId, applicationId: id }, data: { applicationId: null } }),
    db.application.update({
      where: { id },
      data: {
        deletedAt,
        archived: true,
        archivedAt: existing.archivedAt ?? deletedAt,
      },
    }),
  ]);
  await createActivityLog({
    userId,
    applicationId: id,
    entityType: ActivityEntityType.APPLICATION,
    entityId: id,
    action: "deleted",
    oldValue: {
      companyName: existing.companyName,
      roleTitle: existing.roleTitle,
      status: existing.status,
      archived: existing.archived,
    },
    newValue: { deletedAt },
  });
  return { id };
}

export async function changeApplicationStatus(
  userId: string,
  id: string,
  status: ApplicationStatusType,
  note?: string,
) {
  const app = await db.application.findFirst({ where: { id, userId, deletedAt: null } });
  if (!app) throw appError("NOT_FOUND", "This application no longer exists.", { status: 404 });

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
    where: { id: { in: ids }, userId, deletedAt: null },
    data: update,
  });
  return { updatedCount: ids.length };
}

function normalizeBulkIds(ids: string[]) {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))].slice(0, 100);
}

export async function bulkArchiveApplications(userId: string, ids: string[]) {
  const safeIds = normalizeBulkIds(ids);
  if (!safeIds.length) return { updatedCount: 0 };
  const applications = await db.application.findMany({
    where: { userId, id: { in: safeIds }, deletedAt: null },
    select: { id: true },
  });
  await Promise.all(applications.map((application) => archiveApplication(userId, application.id)));
  return { updatedCount: applications.length };
}

export async function bulkRestoreApplications(userId: string, ids: string[]) {
  const safeIds = normalizeBulkIds(ids);
  if (!safeIds.length) return { updatedCount: 0 };
  const applications = await db.application.findMany({
    where: { userId, id: { in: safeIds }, deletedAt: null },
    select: { id: true },
  });
  await Promise.all(applications.map((application) => restoreApplication(userId, application.id)));
  return { updatedCount: applications.length };
}

export async function bulkDeleteApplications(userId: string, ids: string[]) {
  const safeIds = normalizeBulkIds(ids);
  if (!safeIds.length) return { updatedCount: 0 };
  const applications = await db.application.findMany({
    where: { userId, id: { in: safeIds }, deletedAt: null },
    select: { id: true },
  });
  await Promise.all(applications.map((application) => deleteApplication(userId, application.id)));
  return { updatedCount: applications.length };
}

export async function exportJson(userId: string) {
  const applications = await getApplications(userId, { includeArchived: true });
  return JSON.stringify(applications, null, 2);
}
