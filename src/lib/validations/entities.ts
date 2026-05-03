import { z } from "zod";
import {
  ApplicationType,
  DocumentType,
  InterviewOutcome,
  InterviewType,
  RelationshipType,
  Source,
  TaskPriority,
  TimelineEventType,
} from "@prisma/client";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().trim().optional());
const optionalUrl = (message = "Enter a valid URL.") =>
  z.preprocess(emptyToUndefined, z.string().trim().url(message).optional());
const optionalEmail = (message = "Enter a valid email address.") =>
  z.preprocess(emptyToUndefined, z.string().trim().email(message).optional());
const optionalDate = (message = "Enter a valid date.") =>
  z.preprocess(emptyToUndefined, z.coerce.date(message).optional().nullable());
const optionalInt = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number("Enter a valid duration.")
    .int("Enter a whole number of minutes.")
    .min(1, "Duration must be at least 1 minute.")
    .max(480, "Duration must be 480 minutes or fewer.")
    .optional()
    .nullable(),
);

export const interviewSchema = z.object({
  applicationId: z.string().min(1),
  title: z.string().trim().min(1, "Interview title is required."),
  type: z.nativeEnum(InterviewType),
  scheduledAt: z.coerce.date("Enter a valid interview date and time."),
  durationMinutes: optionalInt,
  location: optionalString,
  meetingLink: optionalUrl("Enter a valid meeting link."),
  interviewerName: optionalString,
  interviewerEmail: optionalEmail("Enter a valid interviewer email."),
  preparationNotes: optionalString,
  questionsAsked: optionalString,
  reflection: optionalString,
  outcome: z.nativeEnum(InterviewOutcome).default(InterviewOutcome.PENDING),
  followUpRequired: z.boolean().default(false),
  thankYouSent: z.boolean().default(false),
});

export const taskSchema = z.object({
  applicationType: z.nativeEnum(ApplicationType).default(ApplicationType.JOB),
  applicationId: z.string().optional().nullable(),
  title: z.string().trim().min(1, "Task title is required."),
  description: optionalString,
  dueDate: optionalDate("Enter a valid due date."),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  completed: z.boolean().default(false),
});

export const contactSchema = z.object({
  applicationType: z.nativeEnum(ApplicationType).default(ApplicationType.JOB),
  name: z.string().trim().min(1, "Contact name is required."),
  company: optionalString,
  role: optionalString,
  email: optionalEmail("Enter a valid email address."),
  linkedinUrl: optionalUrl("Enter a valid LinkedIn URL."),
  relationshipType: z.nativeEnum(RelationshipType),
  source: z.nativeEnum(Source).optional().nullable(),
  notes: optionalString,
  lastContactedAt: optionalDate("Enter a valid last contacted date."),
  followUpDate: optionalDate("Enter a valid follow-up date."),
});

export const documentSchema = z.object({
  applicationType: z.nativeEnum(ApplicationType).default(ApplicationType.JOB),
  name: z.string().trim().min(1, "Document name is required."),
  type: z.nativeEnum(DocumentType),
  url: z.string().trim().min(1, "Document URL is required.").url("Enter a valid document URL."),
  version: optionalString,
  notes: optionalString,
  tags: z.array(z.string()).default([]),
});

export const timelineEventSchema = z.object({
  applicationId: z.string().min(1),
  type: z.nativeEnum(TimelineEventType),
  title: z.string().trim().min(1, "Timeline note title is required."),
  description: optionalString,
  occurredAt: z.coerce.date("Enter a valid date and time."),
  attachmentUrl: optionalUrl("Enter a valid attachment URL."),
});
