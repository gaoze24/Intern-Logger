import { describe, expect, it, vi } from "vitest";
import type { ApplicationStatusType } from "@prisma/client";

vi.mock("@/lib/db", () => {
  return {
    db: {
      application: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({
          id: "a1",
          userId: "u1",
          companyName: "Google",
          roleTitle: "SWE Intern",
          status: "APPLIED" as ApplicationStatusType,
          interviews: [],
          tasks: [],
          timelineEvents: [],
          activities: [],
          reminders: [],
          tags: [],
          contacts: [],
          documents: [],
          customStatus: null,
        }),
        findFirst: vi.fn().mockResolvedValue({
          id: "a1",
          userId: "u1",
          status: "APPLIED",
        }),
        update: vi.fn().mockResolvedValue({ id: "a1", status: "ONLINE_ASSESSMENT" }),
      },
    },
  };
});

vi.mock("@/lib/services/activity", () => ({
  createActivityLog: vi.fn(),
  createTimelineEvent: vi.fn(),
}));

import { changeApplicationStatus, createApplication } from "@/lib/services/applications";

describe("application service integration (mocked db)", () => {
  it("creates application", async () => {
    const result = await createApplication("u1", {
      companyName: "Google",
      roleTitle: "SWE Intern",
      status: "APPLIED",
      workMode: "REMOTE",
      source: "LINKEDIN",
      priority: "HIGH",
      referralUsed: false,
      archived: false,
      tagIds: [],
    });
    expect(result.created.id).toBe("a1");
  });

  it("updates status", async () => {
    const updated = await changeApplicationStatus("u1", "a1", "ONLINE_ASSESSMENT");
    expect(updated.status).toBe("ONLINE_ASSESSMENT");
  });
});
