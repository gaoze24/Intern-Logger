import { addDays, format, startOfDay } from "date-fns";
import { ApplicationStatusType, ApplicationType, Prisma, ReminderType } from "@prisma/client";
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

function getConversionRatesFromCounts(
  statusCounts: Record<string, number>,
  totalCount: number,
  acceptedStatus: ApplicationStatusType = ApplicationStatusType.OFFER,
) {
  const total = totalCount || 1;
  const interviews =
    acceptedStatus === ApplicationStatusType.ACCEPTED
      ? statusCounts[ApplicationStatusType.INTERVIEW] ?? 0
      : interviewStatuses.reduce((sum, status) => sum + (statusCounts[status] ?? 0), 0);
  return {
    interviewRate: interviews / total,
    offerRate: (statusCounts[acceptedStatus] ?? 0) / total,
    rejectionRate: (statusCounts[ApplicationStatusType.REJECTED] ?? 0) / total,
  };
}

async function getMonthlyApplicationCountsByMode(userId: string, applicationType: ApplicationType, includeArchived: boolean) {
  const archivedClause = includeArchived ? Prisma.empty : Prisma.sql`AND "archived" = false`;
  const rows = await db.$queryRaw<{ month: Date; count: bigint }[]>`
    SELECT date_trunc('month', "createdAt") AS month, COUNT(*) AS count
    FROM "Application"
    WHERE "userId" = ${userId} AND "applicationType"::text = ${applicationType} ${archivedClause}
    GROUP BY month
    ORDER BY month ASC
  `;

  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[format(row.month, "yyyy-MM")] = Number(row.count);
    return acc;
  }, {});
}

async function getInsights(
  userId: string,
  applicationType: ApplicationType,
  totalApplications: number,
  includeArchived: boolean,
) {
  const now = new Date();
  const weekEnd = addDays(startOfDay(now), 7);
  const staleAppliedCutoff = addDays(now, -14);
  const archivedFilter = includeArchived ? undefined : false;

  const [waitingForResponse, linkedDocuments, highPriorityThisWeek] = await Promise.all([
    db.application.count({
      where: {
        userId,
        applicationType,
        archived: archivedFilter,
        status: ApplicationStatusType.APPLIED,
        updatedAt: { lt: staleAppliedCutoff },
      },
    }),
    db.applicationDocument.count({
      where: { application: { userId, applicationType, archived: archivedFilter } },
    }),
    db.application.count({
      where: {
        userId,
        applicationType,
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
    insights.push(
      applicationType === ApplicationType.UNIVERSITY
        ? "No applications have documents linked yet. Attach admissions materials to improve tracking."
        : "No applications have documents linked yet. Attach resume versions to improve tracking.",
    );
  }
  if (highPriorityThisWeek > 0) {
    insights.push(`${highPriorityThisWeek} high-priority deadlines are due this week.`);
  }
  return insights;
}

export async function getDashboardStats(userId: string, applicationType: ApplicationType = ApplicationType.JOB) {
  const now = new Date();
  const weekEnd = addDays(startOfDay(now), 7);
  const acceptedStatus = applicationType === ApplicationType.UNIVERSITY ? ApplicationStatusType.ACCEPTED : ApplicationStatusType.OFFER;
  const applicationFinalStatuses =
    applicationType === ApplicationType.UNIVERSITY
      ? [ApplicationStatusType.ACCEPTED, ApplicationStatusType.REJECTED, ApplicationStatusType.DEFERRED, ApplicationStatusType.WITHDRAWN, ApplicationStatusType.ARCHIVED]
      : finalStatuses;
  const [
    totalApplications,
    activeApplications,
    accepted,
    rejections,
    interviewsUpcoming,
    deadlinesThisWeek,
    reminderFollowUpsDue,
    contactFollowUpsDue,
    statusGroups,
    monthly,
  ] = await Promise.all([
    db.application.count({ where: { userId, applicationType, archived: false } }),
    db.application.count({ where: { userId, applicationType, archived: false, status: { notIn: applicationFinalStatuses } } }),
    db.application.count({ where: { userId, applicationType, archived: false, status: acceptedStatus } }),
    db.application.count({ where: { userId, applicationType, archived: false, status: ApplicationStatusType.REJECTED } }),
    db.interview.count({ where: { userId, application: { applicationType }, scheduledAt: { gte: now } } }),
    db.application.count({ where: { userId, applicationType, archived: false, deadline: { gte: now, lte: weekEnd } } }),
    db.reminder.count({
      where: {
        userId,
        applicationType,
        completed: false,
        type: ReminderType.FOLLOW_UP,
        remindAt: { lte: weekEnd },
      },
    }),
    db.contact.count({
      where: {
        userId,
        applicationType,
        followUpDate: { lte: weekEnd },
      },
    }),
    db.application.groupBy({
      by: ["status"],
      where: { userId, applicationType, archived: false },
      _count: { _all: true },
    }),
    getMonthlyApplicationCountsByMode(userId, applicationType, false),
  ]);

  const statusCounts = statusGroupsToRecord(statusGroups);
  const conversion = getConversionRatesFromCounts(statusCounts, totalApplications, acceptedStatus);
  const insights = await getInsights(userId, applicationType, totalApplications, false);

  return {
    totalApplications,
    activeApplications,
    interviewsUpcoming,
    offers: accepted,
    accepted,
    rejections,
    deadlinesThisWeek,
    followUpsDue: reminderFollowUpsDue + contactFollowUpsDue,
    statusCounts,
    monthly,
    conversion,
    insights,
  };
}

export async function getAnalyticsSummary(userId: string, applicationType: ApplicationType = ApplicationType.JOB) {
  const [totalApplications, archivedApplications, sourceGroups, priorityGroups, statusGroups, monthly] =
    await Promise.all([
      db.application.count({ where: { userId, applicationType } }),
      db.application.count({ where: { userId, applicationType, archived: true } }),
      db.application.groupBy({
        by: ["source"],
        where: { userId, applicationType },
        _count: { _all: true },
      }),
      db.application.groupBy({
        by: ["priority"],
        where: { userId, applicationType },
        _count: { _all: true },
      }),
      db.application.groupBy({
        by: ["status"],
        where: { userId, applicationType },
        _count: { _all: true },
      }),
      getMonthlyApplicationCountsByMode(userId, applicationType, true),
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
    conversion: getConversionRatesFromCounts(
      statusCounts,
      totalApplications,
      applicationType === ApplicationType.UNIVERSITY ? ApplicationStatusType.ACCEPTED : ApplicationStatusType.OFFER,
    ),
    monthly,
    insights: await getInsights(userId, applicationType, totalApplications, true),
  };
}

export async function getApplicationFunnel(userId: string, applicationType: ApplicationType = ApplicationType.JOB) {
  const statusGroups = await db.application.groupBy({
    by: ["status"],
    where: { userId, applicationType },
    _count: { _all: true },
  });
  const statusCounts = statusGroupsToRecord(statusGroups);
  const order =
    applicationType === ApplicationType.UNIVERSITY
      ? [
          ApplicationStatusType.SUBMITTED,
          ApplicationStatusType.UNDER_REVIEW,
          ApplicationStatusType.INTERVIEW,
          ApplicationStatusType.WAITLISTED,
          ApplicationStatusType.ACCEPTED,
        ]
      : [
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

export async function getUpcomingEvents(userId: string, applicationType: ApplicationType = ApplicationType.JOB) {
  const now = new Date();
  const [deadlines, interviews, tasks, reminders] = await Promise.all([
    db.application.findMany({
      where: { userId, applicationType, deadline: { gte: now }, archived: false },
      select: {
        id: true,
        applicationType: true,
        companyName: true,
        roleTitle: true,
        deadline: true,
        jobDetail: { select: { companyName: true, roleTitle: true } },
        universityDetail: { select: { institutionName: true, programName: true } },
      },
      orderBy: { deadline: "asc" },
      take: 10,
    }),
    db.interview.findMany({
      where: { userId, application: { applicationType }, scheduledAt: { gte: now } },
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
      orderBy: { scheduledAt: "asc" },
      take: 10,
    }),
    db.task.findMany({
      where: { userId, applicationType, dueDate: { gte: now }, completed: false },
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
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    db.reminder.findMany({
      where: { userId, applicationType, remindAt: { gte: now }, completed: false },
      orderBy: { remindAt: "asc" },
      take: 20,
    }),
  ]);
  return { deadlines, interviews, tasks, reminders };
}
