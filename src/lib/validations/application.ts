import { z } from "zod";
import {
  ApplicationStatusType,
  InternshipSeason,
  Priority,
  Source,
  WorkMode,
} from "@prisma/client";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date("Enter a valid date.").optional().nullable());
const optionalUrl = (message: string) =>
  z.preprocess(emptyToUndefined, z.string().trim().url(message).optional().or(z.literal("")));

export const applicationSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required.").max(120, "Company name is too long."),
  roleTitle: z.string().trim().min(1, "Role title is required.").max(160, "Role title is too long."),
  status: z.nativeEnum(ApplicationStatusType).default(ApplicationStatusType.WISHLIST),
  department: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  workMode: z.nativeEnum(WorkMode).default(WorkMode.UNKNOWN),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  source: z.nativeEnum(Source).default(Source.OTHER),
  applicationUrl: optionalUrl("Enter a valid application URL."),
  jobPostingUrl: optionalUrl("Enter a valid job posting URL."),
  deadline: optionalDate,
  appliedDate: optionalDate,
  discoveredDate: optionalDate,
  season: z.nativeEnum(InternshipSeason).optional().nullable(),
  applicationYear: z.number().int().min(2000).max(2100).optional().nullable(),
  compensation: z.string().optional(),
  visaSponsorship: z.boolean().optional().nullable(),
  referralUsed: z.boolean().default(false),
  jobDescription: z.string().optional(),
  notes: z.string().optional(),
  archived: z.boolean().default(false),
  tagIds: z.array(z.string()).default([]),
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
