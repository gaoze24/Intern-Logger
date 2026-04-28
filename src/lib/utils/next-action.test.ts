import { describe, expect, it } from "vitest";
import type { ApplicationWithRelations } from "@/types";
import { suggestNextAction } from "@/lib/utils/next-action";

function makeBase(overrides: Partial<ApplicationWithRelations>): ApplicationWithRelations {
  return {
    id: "a1",
    userId: "u1",
    companyName: "Meta",
    roleTitle: "SWE Intern",
    department: null,
    location: null,
    country: null,
    workMode: "REMOTE",
    status: "APPLIED",
    customStatusId: null,
    priority: "HIGH",
    source: "LINKEDIN",
    applicationUrl: null,
    jobPostingUrl: null,
    deadline: null,
    appliedDate: new Date(Date.now() - 86400000 * 20),
    discoveredDate: null,
    season: null,
    applicationYear: null,
    compensation: null,
    visaSponsorship: null,
    referralUsed: false,
    jobDescription: "great role",
    notes: null,
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(Date.now() - 86400000 * 15),
    interviews: [],
    tasks: [],
    timelineEvents: [],
    activities: [],
    reminders: [],
    tags: [],
    contacts: [],
    documents: [],
    customStatus: null,
    ...overrides,
  };
}

describe("next action helper", () => {
  it("suggests follow-up for stale applied status", () => {
    expect(suggestNextAction(makeBase({}))).toBe("Send follow-up to recruiter");
  });
});
