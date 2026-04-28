import { describe, expect, it } from "vitest";
import type { Application, InternshipSeason } from "@prisma/client";
import { detectDuplicates } from "@/lib/utils/duplicate";

function app(overrides: Partial<Application>): Application {
  return {
    id: "1",
    userId: "u1",
    companyName: "Google",
    roleTitle: "Software Engineer Intern",
    department: null,
    location: null,
    country: null,
    workMode: "REMOTE",
    status: "APPLIED",
    customStatusId: null,
    priority: "HIGH",
    source: "LINKEDIN",
    applicationUrl: "https://app",
    jobPostingUrl: "https://job",
    deadline: null,
    appliedDate: null,
    discoveredDate: null,
    season: "SUMMER" as InternshipSeason,
    applicationYear: 2027,
    compensation: null,
    visaSponsorship: null,
    referralUsed: false,
    jobDescription: null,
    notes: null,
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("duplicate detection", () => {
  it("finds exact duplicates", () => {
    const signals = detectDuplicates([app({})], {
      companyName: "Google",
      roleTitle: "Software Engineer Intern",
      season: "SUMMER",
      jobPostingUrl: "https://job",
      applicationUrl: "https://app",
    });
    expect(signals.length).toBeGreaterThan(0);
  });
});
