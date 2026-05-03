import { addDays, isBefore } from "date-fns";
import { ApplicationStatusType } from "@prisma/client";
type NextActionApplication = {
  status: ApplicationStatusType;
  updatedAt: Date;
  deadline?: Date | null;
  interviews?: { scheduledAt: Date }[];
  documents?: { document: { type: string } }[];
  jobDescription?: string | null;
};

export function suggestNextAction(application: NextActionApplication): string {
  const now = new Date();

  if (application.status === ApplicationStatusType.APPLIED && isBefore(application.updatedAt, addDays(now, -14))) {
    return "Send follow-up to recruiter";
  }

  if (application.status === ApplicationStatusType.SUBMITTED && isBefore(application.updatedAt, addDays(now, -21))) {
    return "Check admissions portal for updates";
  }

  if (application.status === ApplicationStatusType.DOCUMENTS_PENDING) {
    return "Complete required documents";
  }

  const upcomingInterview = (application.interviews ?? [])
    .filter((interview) => interview.scheduledAt > now)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];
  if (upcomingInterview && isBefore(upcomingInterview.scheduledAt, addDays(now, 3))) {
    return "Prepare interview notes";
  }

  if (application.status === ApplicationStatusType.OFFER && application.deadline) {
    return "Review offer before deadline";
  }

  if (application.status === ApplicationStatusType.ACCEPTED && application.deadline) {
    return "Review admission offer before deadline";
  }

  const hasResume = (application.documents ?? []).some((document) => document.document.type === "RESUME");
  if (application.jobDescription && application.documents && !hasResume) {
    return "Attach resume version";
  }

  if (application.deadline && isBefore(application.deadline, addDays(now, 7))) {
    return "Prioritize this application deadline";
  }

  return "No urgent action";
}
