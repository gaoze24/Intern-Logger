import { ActivityEntityType } from "@prisma/client";
import { db } from "@/lib/db";
import {
  contactSchema,
  documentSchema,
  interviewSchema,
  taskSchema,
  timelineEventSchema,
} from "@/lib/validations/entities";
import { createActivityLog, createTimelineEvent } from "@/lib/services/activity";

export async function createInterview(userId: string, input: unknown) {
  const parsed = interviewSchema.parse(input);
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
  if (!interview) throw new Error("Interview not found");
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
  return updated;
}

export async function deleteInterview(userId: string, id: string) {
  const interview = await db.interview.findFirst({ where: { id, userId } });
  if (!interview) throw new Error("Interview not found");
  await db.interview.delete({ where: { id } });
  await createActivityLog({
    userId,
    applicationId: interview.applicationId,
    entityType: ActivityEntityType.INTERVIEW,
    entityId: id,
    action: "deleted",
    oldValue: interview,
  });
  return { id };
}

export async function getInterviews(userId: string) {
  return db.interview.findMany({
    where: { userId },
    orderBy: { scheduledAt: "asc" },
    include: {
      application: { select: { companyName: true, roleTitle: true } },
    },
  });
}

export async function createTask(userId: string, input: unknown) {
  const parsed = taskSchema.parse(input);
  const task = await db.task.create({ data: { ...parsed, userId } });
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
  if (!task) throw new Error("Task not found");
  const updated = await db.task.update({
    where: { id },
    data: parsed,
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
  if (!task) throw new Error("Task not found");
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
  return updated;
}

export async function deleteTask(userId: string, id: string) {
  const task = await db.task.findFirst({ where: { id, userId } });
  if (!task) throw new Error("Task not found");
  await db.task.delete({ where: { id } });
  return { id };
}

export async function getTasks(userId: string) {
  return db.task.findMany({
    where: { userId },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
    include: { application: { select: { companyName: true, roleTitle: true } } },
  });
}

export async function getContacts(userId: string) {
  return db.contact.findMany({
    where: { userId },
    orderBy: [{ followUpDate: "asc" }, { updatedAt: "desc" }],
    include: {
      applications: {
        include: {
          application: {
            select: { id: true, companyName: true, roleTitle: true },
          },
        },
      },
    },
  });
}

export async function createContact(userId: string, input: unknown) {
  const parsed = contactSchema.parse(input);
  return db.contact.create({ data: { ...parsed, userId } });
}

export async function updateContact(userId: string, id: string, input: unknown) {
  const parsed = contactSchema.partial().parse(input);
  return db.contact.updateMany({
    where: { id, userId },
    data: parsed,
  });
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
  if (!app || !contact) throw new Error("Not found");
  return db.applicationContact.upsert({
    where: { applicationId_contactId: { applicationId, contactId } },
    update: { relationshipToApplication },
    create: { applicationId, contactId, relationshipToApplication },
  });
}

export async function createDocument(userId: string, input: unknown) {
  const parsed = documentSchema.parse(input);
  return db.document.create({ data: { ...parsed, userId } });
}

export async function updateDocument(userId: string, id: string, input: unknown) {
  const parsed = documentSchema.partial().parse(input);
  return db.document.updateMany({
    where: { id, userId },
    data: parsed,
  });
}

export async function deleteDocument(userId: string, id: string) {
  await db.document.deleteMany({ where: { id, userId } });
  return { id };
}

export async function getDocuments(userId: string) {
  return db.document.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      applications: {
        include: {
          application: {
            select: { id: true, companyName: true, roleTitle: true },
          },
        },
      },
    },
  });
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
  if (!app || !document) throw new Error("Not found");
  return db.applicationDocument.upsert({
    where: { applicationId_documentId: { applicationId, documentId } },
    update: { usageType, notes },
    create: { applicationId, documentId, usageType, notes },
  });
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
