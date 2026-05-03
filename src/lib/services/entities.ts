import { ActivityEntityType, ApplicationType, Prisma, TimelineEventType } from "@prisma/client";
import { db } from "@/lib/db";
import {
  contactSchema,
  documentSchema,
  interviewSchema,
  taskSchema,
  timelineEventSchema,
} from "@/lib/validations/entities";
import { createActivityLog, createTimelineEvent } from "@/lib/services/activity";
import { appError } from "@/lib/errors";

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type PaginationOptions = {
  applicationType?: ApplicationType;
  page?: number;
  pageSize?: number;
};

const taskListInclude = {
  application: {
    select: {
      applicationType: true,
      companyName: true,
      roleTitle: true,
      jobDetail: { select: { companyName: true, roleTitle: true } },
      universityDetail: { select: { institutionName: true, programName: true } },
    },
  },
} satisfies Prisma.TaskInclude;

const contactListInclude = {
  applications: {
    include: {
      application: {
        select: {
          id: true,
          applicationType: true,
          companyName: true,
          roleTitle: true,
          jobDetail: { select: { companyName: true, roleTitle: true } },
          universityDetail: { select: { institutionName: true, programName: true } },
        },
      },
    },
  },
} satisfies Prisma.ContactInclude;

const documentListInclude = {
  applications: {
    include: {
      application: {
        select: {
          id: true,
          applicationType: true,
          companyName: true,
          roleTitle: true,
          jobDetail: { select: { companyName: true, roleTitle: true } },
          universityDetail: { select: { institutionName: true, programName: true } },
        },
      },
    },
  },
} satisfies Prisma.DocumentInclude;

export type TaskListItem = Prisma.TaskGetPayload<{ include: typeof taskListInclude }>;
export type ContactListItem = Prisma.ContactGetPayload<{ include: typeof contactListInclude }>;
export type DocumentListItem = Prisma.DocumentGetPayload<{ include: typeof documentListInclude }>;

function normalizePagination(options: PaginationOptions = {}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 25));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export async function createInterview(userId: string, input: unknown) {
  const parsed = interviewSchema.parse(input);
  const app = await db.application.findFirst({ where: { id: parsed.applicationId, userId } });
  if (!app) throw appError("NOT_FOUND", "This application no longer exists.", { status: 404 });
  const interview = await db.interview.create({ data: { ...parsed, userId } });
  await createTimelineEvent({
    userId,
    applicationId: parsed.applicationId,
    type: "INTERVIEW_SCHEDULED",
    title: `Interview added: ${parsed.title}`,
    occurredAt: parsed.scheduledAt,
  });
  await createActivityLog({
    userId,
    applicationId: parsed.applicationId,
    entityType: ActivityEntityType.INTERVIEW,
    entityId: interview.id,
    action: "created",
    newValue: interview,
  });
  return interview;
}

export async function updateInterview(userId: string, id: string, input: unknown) {
  const parsed = interviewSchema.partial().parse(input);
  const interview = await db.interview.findFirst({ where: { id, userId } });
  if (!interview) throw appError("NOT_FOUND", "This interview no longer exists.", { status: 404 });
  const updated = await db.interview.update({ where: { id }, data: parsed });
  await createActivityLog({
    userId,
    applicationId: interview.applicationId,
    entityType: ActivityEntityType.INTERVIEW,
    entityId: id,
    action: "updated",
    oldValue: interview,
    newValue: updated,
  });
  await createTimelineEvent({
    userId,
    applicationId: interview.applicationId,
    type: TimelineEventType.INTERVIEW_SCHEDULED,
    title: `Interview updated: ${updated.title}`,
  });
  return updated;
}

export async function deleteInterview(userId: string, id: string) {
  const interview = await db.interview.findFirst({ where: { id, userId } });
  if (!interview) throw appError("NOT_FOUND", "This interview no longer exists.", { status: 404 });
  await db.interview.delete({ where: { id } });
  await createActivityLog({
    userId,
    applicationId: interview.applicationId,
    entityType: ActivityEntityType.INTERVIEW,
    entityId: id,
    action: "deleted",
    oldValue: interview,
  });
  await createTimelineEvent({
    userId,
    applicationId: interview.applicationId,
    type: TimelineEventType.INTERVIEW_SCHEDULED,
    title: `Interview deleted: ${interview.title}`,
  });
  return { id, applicationId: interview.applicationId };
}

export async function markInterviewComplete(userId: string, id: string) {
  const interview = await db.interview.findFirst({ where: { id, userId } });
  if (!interview) throw appError("NOT_FOUND", "This interview no longer exists.", { status: 404 });
  const updated = await db.interview.update({
    where: { id },
    data: { outcome: "PASSED", reflection: interview.reflection ?? "" },
  });
  await createTimelineEvent({
    userId,
    applicationId: interview.applicationId,
    type: TimelineEventType.INTERVIEW_COMPLETED,
    title: `Interview completed: ${interview.title}`,
  });
  await createActivityLog({
    userId,
    applicationId: interview.applicationId,
    entityType: ActivityEntityType.INTERVIEW,
    entityId: id,
    action: "completed",
    oldValue: interview.outcome,
    newValue: updated.outcome,
  });
  return updated;
}

export async function markThankYouSent(userId: string, id: string) {
  const interview = await db.interview.findFirst({ where: { id, userId } });
  if (!interview) throw appError("NOT_FOUND", "This interview no longer exists.", { status: 404 });
  const updated = await db.interview.update({
    where: { id },
    data: { thankYouSent: true },
  });
  await createTimelineEvent({
    userId,
    applicationId: interview.applicationId,
    type: TimelineEventType.FOLLOW_UP_SENT,
    title: `Thank-you sent: ${interview.title}`,
  });
  await createActivityLog({
    userId,
    applicationId: interview.applicationId,
    entityType: ActivityEntityType.INTERVIEW,
    entityId: id,
    action: "thank_you_sent",
    oldValue: interview.thankYouSent,
    newValue: true,
  });
  return updated;
}

export async function getInterviews(userId: string) {
  return db.interview.findMany({
    where: { userId },
    orderBy: { scheduledAt: "asc" },
    include: {
      application: {
        select: {
          applicationType: true,
          companyName: true,
          roleTitle: true,
          jobDetail: { select: { companyName: true, roleTitle: true } },
          universityDetail: { select: { institutionName: true, programName: true } },
        },
      },
    },
  });
}

export async function createTask(userId: string, input: unknown) {
  const parsed = taskSchema.parse(input);
  let applicationType = parsed.applicationType ?? ApplicationType.JOB;
  if (parsed.applicationId) {
    const app = await db.application.findFirst({ where: { id: parsed.applicationId, userId } });
    if (!app) throw appError("NOT_FOUND", "This application no longer exists.", { status: 404 });
    applicationType = app.applicationType;
  }
  const task = await db.task.create({ data: { ...parsed, applicationType, userId } });
  if (parsed.applicationId) {
    await createTimelineEvent({
      userId,
      applicationId: parsed.applicationId,
      type: TimelineEventType.NOTE_ADDED,
      title: `Task added: ${task.title}`,
    });
  }
  await createActivityLog({
    userId,
    applicationId: parsed.applicationId ?? undefined,
    entityType: ActivityEntityType.TASK,
    entityId: task.id,
    action: "created",
    newValue: task,
  });
  return task;
}

export async function updateTask(userId: string, id: string, input: unknown) {
  const parsed = taskSchema.partial().parse(input);
  const task = await db.task.findFirst({ where: { id, userId } });
  if (!task) throw appError("NOT_FOUND", "This task no longer exists.", { status: 404 });
  let applicationType = parsed.applicationType ?? task.applicationType;
  if (parsed.applicationId) {
    const app = await db.application.findFirst({ where: { id: parsed.applicationId, userId } });
    if (!app) throw appError("NOT_FOUND", "This application no longer exists.", { status: 404 });
    applicationType = app.applicationType;
  }
  const updated = await db.task.update({
    where: { id },
    data: { ...parsed, applicationType },
  });
  await createActivityLog({
    userId,
    applicationId: task.applicationId ?? undefined,
    entityType: ActivityEntityType.TASK,
    entityId: id,
    action: "updated",
    oldValue: task,
    newValue: updated,
  });
  return updated;
}

export async function completeTask(userId: string, id: string) {
  const task = await db.task.findFirst({ where: { id, userId } });
  if (!task) throw appError("NOT_FOUND", "This task no longer exists.", { status: 404 });
  const updated = await db.task.update({
    where: { id },
    data: { completed: true, completedAt: new Date() },
  });
  await createActivityLog({
    userId,
    applicationId: task.applicationId ?? undefined,
    entityType: ActivityEntityType.TASK,
    entityId: id,
    action: "completed",
    oldValue: task.completed,
    newValue: true,
  });
  if (task.applicationId) {
    await createTimelineEvent({
      userId,
      applicationId: task.applicationId,
      type: TimelineEventType.NOTE_ADDED,
      title: `Task completed: ${task.title}`,
    });
  }
  return updated;
}

export async function deleteTask(userId: string, id: string) {
  const task = await db.task.findFirst({ where: { id, userId } });
  if (!task) throw appError("NOT_FOUND", "This task no longer exists.", { status: 404 });
  await db.task.delete({ where: { id } });
  if (task.applicationId) {
    await createTimelineEvent({
      userId,
      applicationId: task.applicationId,
      type: TimelineEventType.NOTE_ADDED,
      title: `Task deleted: ${task.title}`,
    });
  }
  await createActivityLog({
    userId,
    applicationId: task.applicationId ?? undefined,
    entityType: ActivityEntityType.TASK,
    entityId: id,
    action: "deleted",
    oldValue: task,
  });
  return { id, applicationId: task.applicationId };
}

export async function getTasks(userId: string, options: PaginationOptions = {}): Promise<PaginatedResult<TaskListItem>> {
  const { page, pageSize, skip } = normalizePagination(options);
  const where = { userId, applicationType: options.applicationType };
  const [total, items] = await Promise.all([
    db.task.count({ where }),
    db.task.findMany({
      where,
      orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
      include: taskListInclude,
      skip,
      take: pageSize,
    }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getContacts(
  userId: string,
  options: PaginationOptions & { search?: string } = {},
): Promise<PaginatedResult<ContactListItem>> {
  const { page, pageSize, skip } = normalizePagination(options);
  const where = {
    userId,
    applicationType: options.applicationType,
    OR: options.search
      ? [
          { name: { contains: options.search, mode: "insensitive" as const } },
          { company: { contains: options.search, mode: "insensitive" as const } },
          { email: { contains: options.search, mode: "insensitive" as const } },
        ]
      : undefined,
  };
  const [total, items] = await Promise.all([
    db.contact.count({ where }),
    db.contact.findMany({
      where,
      orderBy: [{ followUpDate: "asc" }, { updatedAt: "desc" }],
      include: contactListInclude,
      skip,
      take: pageSize,
    }),
  ]);
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function createContact(userId: string, input: unknown) {
  const parsed = contactSchema.parse(input);
  return db.contact.create({ data: { ...parsed, userId } });
}

export async function updateContact(userId: string, id: string, input: unknown) {
  const parsed = contactSchema.partial().parse(input);
  const contact = await db.contact.findFirst({ where: { id, userId } });
  if (!contact) throw appError("NOT_FOUND", "This contact no longer exists.", { status: 404 });
  const updated = await db.contact.update({
    where: { id },
    data: parsed,
  });
  await createActivityLog({
    userId,
    entityType: ActivityEntityType.CONTACT,
    entityId: id,
    action: "updated",
    oldValue: contact,
    newValue: updated,
  });
  return updated;
}

export async function deleteContact(userId: string, id: string) {
  await db.contact.deleteMany({ where: { id, userId } });
  return { id };
}

export async function linkContactToApplication(
  userId: string,
  applicationId: string,
  contactId: string,
  relationshipToApplication?: string,
) {
  const app = await db.application.findFirst({ where: { id: applicationId, userId } });
  const contact = await db.contact.findFirst({ where: { id: contactId, userId } });
  if (!app) throw appError("NOT_FOUND", "This application no longer exists.", { status: 404 });
  if (!contact) throw appError("NOT_FOUND", "The selected contact could not be linked because it no longer exists.", { status: 404 });
  if (contact.applicationType !== app.applicationType) {
    throw appError("LINK_FAILED", "This contact belongs to a different application mode.");
  }
  const link = await db.applicationContact.upsert({
    where: { applicationId_contactId: { applicationId, contactId } },
    update: { relationshipToApplication },
    create: { applicationId, contactId, relationshipToApplication },
  });
  await createTimelineEvent({
    userId,
    applicationId,
    type: TimelineEventType.NOTE_ADDED,
    title: `Contact linked: ${contact.name}`,
  });
  await createActivityLog({
    userId,
    applicationId,
    entityType: ActivityEntityType.CONTACT,
    entityId: contactId,
    action: "linked",
    newValue: link,
  });
  return link;
}

export async function unlinkContactFromApplication(userId: string, applicationId: string, contactId: string) {
  const link = await db.applicationContact.findFirst({
    where: { applicationId, contactId, application: { userId }, contact: { userId } },
    include: { contact: true },
  });
  if (!link) throw appError("NOT_FOUND", "This contact is no longer linked to the application.", { status: 404 });
  await db.applicationContact.delete({
    where: { applicationId_contactId: { applicationId, contactId } },
  });
  await createTimelineEvent({
    userId,
    applicationId,
    type: TimelineEventType.NOTE_ADDED,
    title: `Contact unlinked: ${link.contact.name}`,
  });
  await createActivityLog({
    userId,
    applicationId,
    entityType: ActivityEntityType.CONTACT,
    entityId: contactId,
    action: "unlinked",
    oldValue: link,
  });
  return { applicationId, contactId };
}

export async function createDocument(userId: string, input: unknown) {
  const parsed = documentSchema.parse(input);
  return db.document.create({ data: { ...parsed, userId } });
}

export async function updateDocument(userId: string, id: string, input: unknown) {
  const parsed = documentSchema.partial().parse(input);
  const document = await db.document.findFirst({ where: { id, userId } });
  if (!document) throw appError("NOT_FOUND", "This document no longer exists.", { status: 404 });
  const updated = await db.document.update({
    where: { id },
    data: parsed,
  });
  await createActivityLog({
    userId,
    entityType: ActivityEntityType.DOCUMENT,
    entityId: id,
    action: "updated",
    oldValue: document,
    newValue: updated,
  });
  return updated;
}

export async function deleteDocument(userId: string, id: string) {
  await db.document.deleteMany({ where: { id, userId } });
  return { id };
}

export async function getDocuments(
  userId: string,
  options: PaginationOptions = {},
): Promise<PaginatedResult<DocumentListItem>> {
  const { page, pageSize, skip } = normalizePagination(options);
  const where = { userId, applicationType: options.applicationType };
  const [total, items] = await Promise.all([
    db.document.count({ where }),
    db.document.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: documentListInclude,
      skip,
      take: pageSize,
    }),
  ]);
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function linkDocumentToApplication(
  userId: string,
  applicationId: string,
  documentId: string,
  usageType?: string,
  notes?: string,
) {
  const app = await db.application.findFirst({ where: { id: applicationId, userId } });
  const document = await db.document.findFirst({ where: { id: documentId, userId } });
  if (!app) throw appError("NOT_FOUND", "This application no longer exists.", { status: 404 });
  if (!document) throw appError("NOT_FOUND", "The selected document could not be linked because it no longer exists.", { status: 404 });
  if (document.applicationType !== app.applicationType) {
    throw appError("LINK_FAILED", "This document belongs to a different application mode.");
  }
  const link = await db.applicationDocument.upsert({
    where: { applicationId_documentId: { applicationId, documentId } },
    update: { usageType, notes },
    create: { applicationId, documentId, usageType, notes },
  });
  await createTimelineEvent({
    userId,
    applicationId,
    type: TimelineEventType.NOTE_ADDED,
    title: `Document linked: ${document.name}`,
  });
  await createActivityLog({
    userId,
    applicationId,
    entityType: ActivityEntityType.DOCUMENT,
    entityId: documentId,
    action: "linked",
    newValue: link,
  });
  return link;
}

export async function unlinkDocumentFromApplication(userId: string, applicationId: string, documentId: string) {
  const link = await db.applicationDocument.findFirst({
    where: { applicationId, documentId, application: { userId }, document: { userId } },
    include: { document: true },
  });
  if (!link) throw appError("NOT_FOUND", "This document is no longer linked to the application.", { status: 404 });
  await db.applicationDocument.delete({
    where: { applicationId_documentId: { applicationId, documentId } },
  });
  await createTimelineEvent({
    userId,
    applicationId,
    type: TimelineEventType.NOTE_ADDED,
    title: `Document unlinked: ${link.document.name}`,
  });
  await createActivityLog({
    userId,
    applicationId,
    entityType: ActivityEntityType.DOCUMENT,
    entityId: documentId,
    action: "unlinked",
    oldValue: link,
  });
  return { applicationId, documentId };
}

export async function createTimelineEventEntry(userId: string, input: unknown) {
  const parsed = timelineEventSchema.parse(input);
  return createTimelineEvent({
    userId,
    applicationId: parsed.applicationId,
    type: parsed.type,
    title: parsed.title,
    description: parsed.description,
    occurredAt: parsed.occurredAt,
    attachmentUrl: parsed.attachmentUrl || undefined,
  });
}
