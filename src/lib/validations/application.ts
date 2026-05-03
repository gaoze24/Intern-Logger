import { z } from "zod";
import {
  ApplicationStatusType,
  ApplicationType,
  DegreeLevel,
  IntakeTerm,
  InternshipSeason,
  Priority,
  Source,
  WorkMode,
} from "@prisma/client";
import { isStatusAllowedForMode } from "@/constants/app";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().trim().optional());
const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date("Enter a valid date.").optional().nullable());
const optionalUrl = (message: string) =>
  z.preprocess(emptyToUndefined, z.string().trim().url(message).optional().or(z.literal("")));
const optionalYear = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number("Enter a valid year.")
    .int("Enter a whole year.")
    .min(2000, "Year must be 2000 or later.")
    .max(2100, "Year must be 2100 or earlier.")
    .optional()
    .nullable(),
);

export const applicationSchema = z
  .object({
    applicationType: z.nativeEnum(ApplicationType).default(ApplicationType.JOB),
    companyName: z.string().trim().optional().default(""),
    roleTitle: z.string().trim().optional().default(""),
    institutionName: z.string().trim().optional().default(""),
    programName: z.string().trim().optional().default(""),
    status: z.nativeEnum(ApplicationStatusType).default(ApplicationStatusType.WISHLIST),
    department: optionalString,
    facultyOrDepartment: optionalString,
    location: optionalString,
    country: optionalString,
    campus: optionalString,
    workMode: z.nativeEnum(WorkMode).default(WorkMode.UNKNOWN),
    priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
    source: z.nativeEnum(Source).default(Source.OTHER),
    applicationUrl: optionalUrl("Enter a valid application URL."),
    jobPostingUrl: optionalUrl("Enter a valid job posting URL."),
    programUrl: optionalUrl("Enter a valid program URL."),
    applicationPortalUrl: optionalUrl("Enter a valid application portal URL."),
    deadline: optionalDate,
    appliedDate: optionalDate,
    submittedDate: optionalDate,
    discoveredDate: optionalDate,
    season: z.nativeEnum(InternshipSeason).optional().nullable(),
    applicationYear: optionalYear,
    applicationRound: optionalString,
    intakeTerm: z.nativeEnum(IntakeTerm).optional().nullable(),
    intakeYear: optionalYear,
    degreeLevel: z.nativeEnum(DegreeLevel).optional().nullable(),
    compensation: optionalString,
    tuitionEstimate: optionalString,
    fundingStatus: optionalString,
    testRequirementStatus: optionalString,
    recommendationRequirementStatus: optionalString,
    visaSponsorship: z.boolean().optional().nullable(),
    referralUsed: z.boolean().default(false),
    scholarshipApplied: z.boolean().default(false),
    jobDescription: optionalString,
    statementPrompt: optionalString,
    notes: optionalString,
    archived: z.boolean().default(false),
    tagIds: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (!isStatusAllowedForMode(data.status, data.applicationType)) {
      ctx.addIssue({
        code: "custom",
        path: ["status"],
        message: "Choose a status that belongs to the selected application mode.",
      });
    }

    if (data.applicationType === ApplicationType.UNIVERSITY) {
      if (!data.institutionName.trim()) {
        ctx.addIssue({ code: "custom", path: ["institutionName"], message: "Institution name is required." });
      }
      if (!data.programName.trim()) {
        ctx.addIssue({ code: "custom", path: ["programName"], message: "Program name is required." });
      }
      return;
    }

    if (!data.companyName.trim()) {
      ctx.addIssue({ code: "custom", path: ["companyName"], message: "Company name is required." });
    }
    if (!data.roleTitle.trim()) {
      ctx.addIssue({ code: "custom", path: ["roleTitle"], message: "Role title is required." });
    }
  });

export const applicationFiltersSchema = z.object({
  search: z.string().optional(),
  statuses: z.array(z.nativeEnum(ApplicationStatusType)).optional(),
  priorities: z.array(z.nativeEnum(Priority)).optional(),
  season: z.nativeEnum(InternshipSeason).optional(),
  country: z.string().optional(),
  workMode: z.nativeEnum(WorkMode).optional(),
  source: z.nativeEnum(Source).optional(),
  deadlineFrom: optionalDate,
  deadlineTo: optionalDate,
  appliedFrom: optionalDate,
  appliedTo: optionalDate,
  hasReferral: z.boolean().optional(),
  hasUpcomingInterview: z.boolean().optional(),
  needsFollowUp: z.boolean().optional(),
  includeArchived: z.boolean().default(false),
});
