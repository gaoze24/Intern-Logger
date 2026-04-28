import { describe, expect, it } from "vitest";
import { getDeadlineUrgency, getStatusHealth } from "@/lib/utils/date";

describe("deadline urgency", () => {
  it("marks overdue deadlines", () => {
    expect(getDeadlineUrgency(new Date(Date.now() - 86400000))).toBe("overdue");
  });

  it("marks near deadlines", () => {
    expect(getDeadlineUrgency(new Date(Date.now() + 86400000 * 2))).toBe("in3days");
  });
});

describe("status health", () => {
  it("returns closed for final states", () => {
    expect(getStatusHealth(new Date(), true)).toBe("closed");
  });
});
