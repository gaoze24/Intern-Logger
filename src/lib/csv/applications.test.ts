import { describe, expect, it } from "vitest";
import { parseApplicationsCsv } from "@/lib/csv/applications";

describe("csv parser", () => {
  it("parses rows with headers", () => {
    const csv = "companyName,roleTitle,location\nGoogle,Software Engineer Intern,Singapore";
    const parsed = parseApplicationsCsv(csv);
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0].companyName).toBe("Google");
  });
});
