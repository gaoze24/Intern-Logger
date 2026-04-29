import { addDays, format, startOfDay } from "date-fns";
import { ApplicationStatusType, Prisma, ReminderType } from "@prisma/client";
import { db } from "@/lib/db";

const finalStatuses = [
  ApplicationStatusType.REJECTED,
  ApplicationStatusType.WITHDRAWN,
  ApplicationStatusType.ARCHIVED,
];

const interviewStatuses = [
  ApplicationStatusType.RECRUITER_SCREEN,
  ApplicationStatusType.TECHNICAL_INTERVIEW,
  ApplicationStatusType.BEHAVIORAL_INTERVIEW,
  ApplicationStatusType.FINAL_ROUND,
  ApplicationStatusType.OFFER,
];

function countRowsToRecord<T extends string>(rows: { key: T; count: number }[]) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.key] = row.count;
    return acc;
  }, {});
}

function statusGroupsToRecord(rows: { status: ApplicationStatusType; _count: { _all: number } }[]) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});
}

function getConversionRatesFromCounts(statusCounts: Record<string, number>, totalCount: number) {
  const total = totalCount || 1;
  const interviews = interviewStatuses.reduce((sum, status) => sum + (statusCounts[status] ?? 0), 0);
  return {
    interviewRate: interviews / total,
    offerRate: (statusCounts[ApplicationStatusType.OFFER] ?? 0) / total,
    rejectionRate: (statusCounts[ApplicationStatusType.REJECTED] ?? 0) / total,
  };
}

async function getMonthlyApplicationCounts(userId: string, includeArchived: boolean) {
  const archivedClause = includeArchived ? Prisma.empty : Prisma.sql`AND "archived" = false`;
  const rows = await db.$queryRaw<{ month: Date; count: bigint }[]>`
    SELECT date_trunc('month', "createdAt") AS month, COUNT(*) AS count
    FROM "Application"
    WHERE "userId" = ${userId} ${archivedClause}
    GROUP BY month
    ORDER BY month ASC
  `;

  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[format(row.month, "yyyy-MM")] = Number(row.count);
    return acc;
  }, {});
}

async function getInsights(userId: string, totalApplications: number, includeArchived: boolean) {
  const now = new Date();
  const weekEnd = addDays(startOfDay(now), 7);
  const staleAppliedCutoff = addDays(now, -14);
  const archivedFilter = includeArchived ? undefined : false;

  const [waitingForResponse, linkedDocuments, highPriorityThisWeek] = await Promise.all([
    db.application.count({
      where: {
        userId,
        archived: archivedFilter,
        status: ApplicationStatusType.APPLIED,
        updatedAt: { lt: staleAppliedCutoff },
      },
    }),
    db.applicationDocument.count({
      where: { application: { userId, archived: archivedFilter } },
    }),
    db.application.count({
      where: {
        userId,
        archived: archivedFilter,
        priority: { in: ["HIGH", "DREAM"] },
        deadline: { gte: now, lte: weekEnd },
      },
    }),
  ]);

  const insights: string[] = [];
  if (waitingForResponse > 0) {
    insights.push(`You have ${waitingForResponse} applications waiting for response for more than 14 days.`);
  }
  if (linkedDocuments === 0 && totalApplications > 0) {
    insights.push("No applications have documents linked yet. Attach resume versions to improve tracking.");
  }
  if (highPriorityThisWeek > 0) {
    insights.push(`${highPriorityThisWeek} high-priority deadlines are due this week.`);
  }
  return insights;
}

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const weekEnd = addDays(startOfDay(now), 7);
  const [
    totalApplications,
    activeApplications,
    offers,
    rejections,
    interviewsUpcoming,
    deadlinesThisWeek,
    reminderFollowUpsDue,
    contactFollowUpsDue,
    statusGroups,
    monthly,
  ] = await Promise.all([
    db.application.count({ where: { userId, archived: false } }),
    db.application.count({ where: { userId, archived: false, status: { notIn: finalStatuses } } }),
    db.application.count({ where: { userId, archived: false, status: ApplicationStatusType.OFFER } }),
    db.application.count({ where: { userId, archived: false, status: ApplicationStatusType.REJECTED } }),
    db.interview.count({ where: { userId, scheduledAt: { gte: now } } }),
    db.application.count({ where: { userId, archived: false, deadline: { gte: now, lte: weekEnd } } }),
    db.reminder.count({
      where: {
        userId,
        completed: false,
        type: ReminderType.FOLLOW_UP,
        remindAt: { lte: weekEnd },
      },
    }),
    db.contact.count({
      where: {
        userId,
        followUpDate: { lte: weekEnd },
      },
    }),
    db.application.groupBy({
      by: ["status"],
      where: { userId, archived: false },
      _count: { _all: true },
    }),
    getMonthlyApplicationCounts(userId, false),
  ]);

  const statusCounts = statusGroupsToRecord(statusGroups);
  const conversion = getConversionRatesFromCounts(statusCounts, totalApplications);
  const insights = await getInsights(userId, totalApplications, false);

  return {
    totalApplications,
    activeApplications,
    interviewsUpcoming,
    offers,
    rejections,
    deadlinesThisWeek,
    followUpsDue: reminderFollowUpsDue + contactFollowUpsDue,
    statusCounts,
    monthly,
    conversion,
    insights,
  };
}

export async function getAnalyticsSummary(userId: string) {
  const [totalApplications, archivedApplications, sourceGroups, priorityGroups, statusGroups, monthly] =
    await Promise.all([
      db.application.count({ where: { userId } }),
      db.application.count({ where: { userId, archived: true } }),
      db.application.groupBy({
        by: ["source"],
        where: { userId },
        _count: { _all: true },
      }),
      db.application.groupBy({
        by: ["priority"],
        where: { userId },
        _count: { _all: true },
      }),
      db.application.groupBy({
        by: ["status"],
        where: { userId },
        _count: { _all: true },
      }),
      getMonthlyApplicationCounts(userId, true),
    ]);

  const statusCounts = statusGroupsToRecord(statusGroups);

  return {
    totals: {
      totalApplications,
      archivedApplications,
      activeApplications: totalApplications - archivedApplications,
    },
    bySource: countRowsToRecord(sourceGroups.map((row) => ({ key: row.source, count: row._count._all }))),
    byPriority: countRowsToRecord(priorityGroups.map((row) => ({ key: row.priority, count: row._count._all }))),
    conversion: getConversionRatesFromCounts(statusCounts, totalApplications),
    monthly,
    insights: await getInsights(userId, totalApplications, true),
  };
}

export async function getApplicationFunnel(userId: string) {
  const statusGroups = await db.application.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });
  const statusCounts = statusGroupsToRecord(statusGroups);
  const order = [
    ApplicationStatusType.APPLIED,
    ApplicationStatusType.ONLINE_ASSESSMENT,
    ApplicationStatusType.TECHNICAL_INTERVIEW,
    ApplicationStatusType.FINAL_ROUND,
    ApplicationStatusType.OFFER,
  ];
  return order.map((status) => ({
    status,
    count: statusCounts[status] ?? 0,
  }));
}

export async function getUpcomingEvents(userId: string) {
  const now = new Date();
  const [deadlines, interviews, tasks, reminders] = await Promise.all([
    db.application.findMany({
      where: { userId, deadline: { gte: now }, archived: false },
      select: { id: true, companyName: true, roleTitle: true, deadline: true },
      orderBy: { deadline: "asc" },
      take: 10,
    }),
    db.interview.findMany({
      where: { userId, scheduledAt: { gte: now } },
      include: { application: { select: { companyName: true, roleTitle: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 10,
    }),
    db.task.findMany({
      where: { userId, dueDate: { gte: now }, completed: false },
      include: { application: { select: { companyName: true, roleTitle: true } } },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    db.reminder.findMany({
      where: { userId, remindAt: { gte: now }, completed: false },
      orderBy: { remindAt: "asc" },
      take: 20,
    }),
  ]);
  return { deadlines, interviews, tasks, reminders };
}
