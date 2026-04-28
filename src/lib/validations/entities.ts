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

export const interviewSchema = z.object({
  applicationId: z.string().min(1),
  title: z.string().min(1),
  type: z.nativeEnum(InterviewType),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.number().int().min(1).max(480).optional().nullable(),
  location: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  interviewerName: z.string().optional(),
  interviewerEmail: z.string().email().optional().or(z.literal("")),
  preparationNotes: z.string().optional(),
  questionsAsked: z.string().optional(),
  reflection: z.string().optional(),
  outcome: z.nativeEnum(InterviewOutcome).default(InterviewOutcome.PENDING),
  followUpRequired: z.boolean().default(false),
  thankYouSent: z.boolean().default(false),
});

export const taskSchema = z.object({
  applicationId: z.string().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  completed: z.boolean().default(false),
});

export const contactSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  relationshipType: z.nativeEnum(RelationshipType),
  source: z.nativeEnum(Source).optional().nullable(),
  notes: z.string().optional(),
  lastContactedAt: z.coerce.date().optional().nullable(),
  followUpDate: z.coerce.date().optional().nullable(),
});

export const documentSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(DocumentType),
  url: z.string().url(),
  version: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const timelineEventSchema = z.object({
  applicationId: z.string().min(1),
  type: z.nativeEnum(TimelineEventType),
  title: z.string().min(1),
  description: z.string().optional(),
  occurredAt: z.coerce.date(),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
});
