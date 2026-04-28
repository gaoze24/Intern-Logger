import { z } from "zod";
import {
  ApplicationStatusType,
  InternshipSeason,
  Priority,
  Source,
  WorkMode,
} from "@prisma/client";

const optionalDate = z.coerce.date().optional().nullable();

export const applicationSchema = z.object({
  companyName: z.string().min(1, "Company is required"),
  roleTitle: z.string().min(1, "Role is required"),
  status: z.nativeEnum(ApplicationStatusType).default(ApplicationStatusType.WISHLIST),
  department: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  workMode: z.nativeEnum(WorkMode).default(WorkMode.UNKNOWN),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  source: z.nativeEnum(Source).default(Source.OTHER),
  applicationUrl: z.string().url().optional().or(z.literal("")),
  jobPostingUrl: z.string().url().optional().or(z.literal("")),
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
