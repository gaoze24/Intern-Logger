import type { InternshipSeason } from "@prisma/client";

function similarity(a: string, b: string) {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  if (x === y) return 1;
  if (x.includes(y) || y.includes(x)) return 0.8;
  const xWords = new Set(x.split(/\s+/));
  const yWords = new Set(y.split(/\s+/));
  const intersection = [...xWords].filter((word) => yWords.has(word)).length;
  return intersection / Math.max(xWords.size, yWords.size, 1);
}

export type DuplicateSignal = {
  applicationId: string;
  reason: "exact_company_role_season" | "similar_company_role" | "same_job_url" | "same_application_url";
  score: number;
};

export type DuplicateComparableApplication = {
  id: string;
  companyName: string;
  roleTitle: string;
  season: InternshipSeason | null;
  jobPostingUrl: string | null;
  applicationUrl: string | null;
};

export type DuplicateIncomingApplication = Pick<
  DuplicateComparableApplication,
  "companyName" | "roleTitle" | "season" | "jobPostingUrl" | "applicationUrl"
>;

export function detectDuplicates(
  existing: DuplicateComparableApplication[],
  incoming: DuplicateIncomingApplication,
): DuplicateSignal[] {
  const signals: DuplicateSignal[] = [];

  for (const app of existing) {
    if (
      app.companyName.toLowerCase() === incoming.companyName.toLowerCase() &&
      app.roleTitle.toLowerCase() === incoming.roleTitle.toLowerCase() &&
      app.season === incoming.season
    ) {
      signals.push({ applicationId: app.id, reason: "exact_company_role_season", score: 1 });
    }

    const roleSim = similarity(app.roleTitle, incoming.roleTitle);
    if (app.companyName.toLowerCase() === incoming.companyName.toLowerCase() && roleSim >= 0.7) {
      signals.push({ applicationId: app.id, reason: "similar_company_role", score: roleSim });
    }

    if (incoming.jobPostingUrl && app.jobPostingUrl && app.jobPostingUrl === incoming.jobPostingUrl) {
      signals.push({ applicationId: app.id, reason: "same_job_url", score: 1 });
    }

    if (incoming.applicationUrl && app.applicationUrl && app.applicationUrl === incoming.applicationUrl) {
      signals.push({ applicationId: app.id, reason: "same_application_url", score: 1 });
    }
  }

  return signals.sort((a, b) => b.score - a.score);
}
