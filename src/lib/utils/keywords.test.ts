import { describe, expect, it } from "vitest";
import { extractKeywords } from "@/lib/utils/keywords";

describe("keyword extraction", () => {
  it("extracts skills and sections", () => {
    const parsed = extractKeywords(`
Responsibilities:
- Build APIs with TypeScript and React
Requirements:
- 2 years experience with SQL and AWS
    `);
    expect(parsed.skills).toContain("typescript");
    expect(parsed.skills).toContain("react");
    expect(parsed.yearsOfExperience[0]).toContain("2 years");
  });
});
