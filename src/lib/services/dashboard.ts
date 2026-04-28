import { addDays, startOfDay } from "date-fns";
import { ApplicationStatusType } from "@prisma/client";
import { db } from "@/lib/db";
import { getApplications } from "@/lib/services/applications";
import { generateInsights, getApplicationsByMonth, getConversionRates } from "@/lib/analytics/metrics";

export async function getDashboardStats(userId: string) {
  const applications = await getApplications(userId, { includeArchived: false });
  const now = new Date();
  const weekEnd = addDays(startOfDay(now), 7);

  const finalStatuses = new Set<ApplicationStatusType>([
    ApplicationStatusType.REJECTED,
    ApplicationStatusType.WITHDRAWN,
    ApplicationStatusType.ARCHIVED,
  ]);
  const totalApplications = applications.length;
  const activeApplications = applications.filter((app) => !finalStatuses.has(app.status)).length;
  const offers = applications.filter((app) => app.status === ApplicationStatusType.OFFER).length;
  const rejections = applications.filter((app) => app.status === ApplicationStatusType.REJECTED).length;
  const interviewsUpcoming = applications.reduce(
    (count, app) => count + app.interviews.filter((i) => i.scheduledAt > now).length,
    0,
  );
  const deadlinesThisWeek = applications.filter(
    (app) => app.deadline && app.deadline >= now && app.deadline <= weekEnd,
  ).length;
  const followUpsDue = applications.reduce(
    (count, app) => count + app.reminders.filter((r) => !r.completed && r.remindAt <= weekEnd).length,
    0,
  );

  const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});

  const monthly = getApplicationsByMonth(applications);
  const conversion = getConversionRates(applications);
  const insights = generateInsights(applications);

  return {
    totalApplications,
    activeApplications,
    interviewsUpcoming,
    offers,
    rejections,
    deadlinesThisWeek,
    followUpsDue,
    statusCounts,
    monthly,
    conversion,
    insights,
  };
}

export async function getAnalyticsSummary(userId: string) {
  const applications = await getApplications(userId, { includeArchived: true });
  const bySource = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.source] = (acc[app.source] ?? 0) + 1;
    return acc;
  }, {});

  const byPriority = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.priority] = (acc[app.priority] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totals: {
      totalApplications: applications.length,
      archivedApplications: applications.filter((app) => app.archived).length,
      activeApplications: applications.filter((app) => !app.archived).length,
    },
    bySource,
    byPriority,
    conversion: getConversionRates(applications),
    monthly: getApplicationsByMonth(applications),
    insights: generateInsights(applications),
  };
}

export async function getApplicationFunnel(userId: string) {
  const applications = await db.application.findMany({
    where: { userId },
    select: { status: true },
  });
  const order = [
    ApplicationStatusType.APPLIED,
    ApplicationStatusType.ONLINE_ASSESSMENT,
    ApplicationStatusType.TECHNICAL_INTERVIEW,
    ApplicationStatusType.FINAL_ROUND,
    ApplicationStatusType.OFFER,
  ];
  return order.map((status) => ({
    status,
    count: applications.filter((app) => app.status === status).length,
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
