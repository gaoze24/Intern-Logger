import { ActivityEntityType, TimelineEventType } from "@prisma/client";
import { db } from "@/lib/db";

export async function createTimelineEvent(input: {
  userId: string;
  applicationId: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  occurredAt?: Date;
  attachmentUrl?: string;
}) {
  return db.timelineEvent.create({
    data: {
      userId: input.userId,
      applicationId: input.applicationId,
      type: input.type,
      title: input.title,
      description: input.description,
      occurredAt: input.occurredAt ?? new Date(),
      attachmentUrl: input.attachmentUrl,
    },
  });
}

export async function createActivityLog(input: {
  userId: string;
  applicationId?: string;
  entityType: ActivityEntityType;
  entityId: string;
  action: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  return db.activityLog.create({
    data: {
      userId: input.userId,
      applicationId: input.applicationId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      oldValue: input.oldValue as object | undefined,
      newValue: input.newValue as object | undefined,
    },
  });
}
