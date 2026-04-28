import { addDays, isBefore } from "date-fns";
import { ApplicationStatusType } from "@prisma/client";
import type { ApplicationWithRelations } from "@/types";

export function suggestNextAction(application: ApplicationWithRelations): string {
  const now = new Date();

  if (application.status === ApplicationStatusType.APPLIED && isBefore(application.updatedAt, addDays(now, -14))) {
    return "Send follow-up to recruiter";
  }

  const upcomingInterview = application.interviews
    .filter((interview) => interview.scheduledAt > now)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];
  if (upcomingInterview && isBefore(upcomingInterview.scheduledAt, addDays(now, 3))) {
    return "Prepare interview notes";
  }

  if (application.status === ApplicationStatusType.OFFER && application.deadline) {
    return "Review offer before deadline";
  }

  const hasResume = application.documents.some((document) => document.document.type === "RESUME");
  if (application.jobDescription && !hasResume) {
    return "Attach resume version";
  }

  if (application.deadline && isBefore(application.deadline, addDays(now, 7))) {
    return "Prioritize this application deadline";
  }

  return "No urgent action";
}
