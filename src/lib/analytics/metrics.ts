import { differenceInCalendarDays, format } from "date-fns";
import { ApplicationStatusType } from "@prisma/client";
import type { ApplicationWithRelations } from "@/types";

export function groupBy<T>(items: T[], key: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

export function getApplicationsByMonth(applications: ApplicationWithRelations[]) {
  return groupBy(applications, (app) => format(app.createdAt, "yyyy-MM"));
}

export function getConversionRates(applications: ApplicationWithRelations[]) {
  const total = applications.length || 1;
  const interviewStatuses = new Set<ApplicationStatusType>([
    ApplicationStatusType.RECRUITER_SCREEN,
    ApplicationStatusType.TECHNICAL_INTERVIEW,
    ApplicationStatusType.BEHAVIORAL_INTERVIEW,
    ApplicationStatusType.FINAL_ROUND,
    ApplicationStatusType.OFFER,
  ]);
  const interviews = applications.filter((a) =>
    interviewStatuses.has(a.status),
  ).length;
  const offers = applications.filter((a) => a.status === ApplicationStatusType.OFFER).length;
  const rejections = applications.filter((a) => a.status === ApplicationStatusType.REJECTED).length;
  return {
    interviewRate: interviews / total,
    offerRate: offers / total,
    rejectionRate: rejections / total,
  };
}

export function getAverageDaysToOffer(applications: ApplicationWithRelations[]) {
  const offerApps = applications.filter((app) => app.status === ApplicationStatusType.OFFER && app.appliedDate);
  if (!offerApps.length) return null;
  const totalDays = offerApps.reduce((sum, app) => sum + differenceInCalendarDays(app.updatedAt, app.appliedDate!), 0);
  return totalDays / offerApps.length;
}

export function generateInsights(applications: ApplicationWithRelations[]) {
  const waitingForResponse = applications.filter(
    (app) => app.status === ApplicationStatusType.APPLIED && differenceInCalendarDays(new Date(), app.updatedAt) > 14,
  );
  const withDocuments = applications.filter((app) => app.documents.length > 0).length;
  const highPriorityThisWeek = applications.filter(
    (app) =>
      (app.priority === "HIGH" || app.priority === "DREAM") &&
      app.deadline &&
      differenceInCalendarDays(app.deadline, new Date()) <= 7,
  );

  const insights: string[] = [];
  if (waitingForResponse.length > 0) {
    insights.push(`You have ${waitingForResponse.length} applications waiting for response for more than 14 days.`);
  }
  if (withDocuments === 0 && applications.length > 0) {
    insights.push("No applications have documents linked yet. Attach resume versions to improve tracking.");
  }
  if (highPriorityThisWeek.length > 0) {
    insights.push(`${highPriorityThisWeek.length} high-priority deadlines are due this week.`);
  }

  return insights;
}
