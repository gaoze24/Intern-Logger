import { ReminderType } from "@prisma/client";
import { db } from "@/lib/db";

export async function createReminder(input: {
  userId: string;
  title: string;
  remindAt: Date;
  type: ReminderType;
  applicationId?: string;
  interviewId?: string;
  taskId?: string;
}) {
  return db.reminder.create({ data: input });
}

export async function getPendingReminders(userId: string) {
  return db.reminder.findMany({
    where: { userId, completed: false },
    orderBy: { remindAt: "asc" },
  });
}
