import { describe, expect, it } from "vitest";
import {
  getApplicationPrimaryTitle,
  getApplicationSecondaryTitle,
  getStatusOptions,
  isStatusAllowedForMode,
} from "@/constants/app";

describe("application mode constants", () => {
  it("uses job display titles from job details first", () => {
    const application = {
      applicationType: "JOB" as const,
      companyName: "Legacy Co",
      roleTitle: "Legacy Role",
      jobDetail: { companyName: "Acme", roleTitle: "Software Engineer" },
    };

    expect(getApplicationPrimaryTitle(application)).toBe("Acme");
    expect(getApplicationSecondaryTitle(application)).toBe("Software Engineer");
  });

  it("uses university display titles from university details first", () => {
    const application = {
      applicationType: "UNIVERSITY" as const,
      companyName: "Legacy Institution",
      roleTitle: "Legacy Program",
      universityDetail: { institutionName: "NUS", programName: "MComp" },
    };

    expect(getApplicationPrimaryTitle(application)).toBe("NUS");
    expect(getApplicationSecondaryTitle(application)).toBe("MComp");
  });

  it("keeps mode-specific status sets separated", () => {
    expect(getStatusOptions("JOB").map((option) => option.value)).toContain("OFFER");
    expect(getStatusOptions("UNIVERSITY").map((option) => option.value)).toContain("ACCEPTED");
    expect(isStatusAllowedForMode("ACCEPTED", "JOB")).toBe(false);
    expect(isStatusAllowedForMode("ACCEPTED", "UNIVERSITY")).toBe(true);
  });
});
