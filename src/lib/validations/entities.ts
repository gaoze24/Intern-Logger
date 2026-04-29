import { z } from "zod";
import {
  DocumentType,
  InterviewOutcome,
  InterviewType,
  RelationshipType,
  Source,
  TaskPriority,
  TimelineEventType,
} from "@prisma/client";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalEmail = z.preprocess(emptyToUndefined, z.string().email().optional());
const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional().nullable());
const optionalInt = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().min(1).max(480).optional().nullable(),
);

export const interviewSchema = z.object({
  applicationId: z.string().min(1),
  title: z.string().min(1),
  type: z.nativeEnum(InterviewType),
  scheduledAt: z.coerce.date(),
  durationMinutes: optionalInt,
  location: optionalString,
  meetingLink: optionalUrl,
  interviewerName: optionalString,
  interviewerEmail: optionalEmail,
  preparationNotes: optionalString,
  questionsAsked: optionalString,
  reflection: optionalString,
  outcome: z.nativeEnum(InterviewOutcome).default(InterviewOutcome.PENDING),
  followUpRequired: z.boolean().default(false),
  thankYouSent: z.boolean().default(false),
});

export const taskSchema = z.object({
  applicationId: z.string().optional().nullable(),
  title: z.string().min(1),
  description: optionalString,
  dueDate: optionalDate,
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  completed: z.boolean().default(false),
});

export const contactSchema = z.object({
  name: z.string().min(1),
  company: optionalString,
  role: optionalString,
  email: optionalEmail,
  linkedinUrl: optionalUrl,
  relationshipType: z.nativeEnum(RelationshipType),
  source: z.nativeEnum(Source).optional().nullable(),
  notes: optionalString,
  lastContactedAt: optionalDate,
  followUpDate: optionalDate,
});

export const documentSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(DocumentType),
  url: z.string().url(),
  version: optionalString,
  notes: optionalString,
  tags: z.array(z.string()).default([]),
});

export const timelineEventSchema = z.object({
  applicationId: z.string().min(1),
  type: z.nativeEnum(TimelineEventType),
  title: z.string().min(1),
  description: optionalString,
  occurredAt: z.coerce.date(),
  attachmentUrl: optionalUrl,
});
