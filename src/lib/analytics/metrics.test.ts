import { describe, expect, it } from "vitest";
import type { ApplicationWithRelations } from "@/types";
import { getConversionRates } from "@/lib/analytics/metrics";

function mockApp(status: ApplicationWithRelations["status"]): ApplicationWithRelations {
  return {
    id: Math.random().toString(),
    userId: "u1",
    applicationType: "JOB",
    companyName: "X",
    roleTitle: "Y",
    department: null,
    location: null,
    country: null,
    workMode: "REMOTE",
    status,
    customStatusId: null,
    priority: "MEDIUM",
    source: "OTHER",
    applicationUrl: null,
    jobPostingUrl: null,
    deadline: null,
    appliedDate: null,
    discoveredDate: null,
    season: null,
    applicationYear: null,
    compensation: null,
    visaSponsorship: null,
    referralUsed: false,
    jobDescription: null,
    notes: null,
    archived: false,
    archivedAt: null,
    previousStatusBeforeArchive: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    interviews: [],
    tasks: [],
    timelineEvents: [],
    activities: [],
    reminders: [],
    tags: [],
    contacts: [],
    documents: [],
    customStatus: null,
  };
}

describe("analytics metrics", () => {
  it("calculates conversion rates", () => {
    const rates = getConversionRates([mockApp("APPLIED"), mockApp("OFFER"), mockApp("REJECTED")]);
    expect(rates.offerRate).toBeCloseTo(1 / 3);
    expect(rates.rejectionRate).toBeCloseTo(1 / 3);
  });
});
