import type {
  ActivityLog,
  Application,
  ApplicationStatus,
  Contact,
  Document,
  Interview,
  Reminder,
  Tag,
  Task,
  TimelineEvent,
} from "@prisma/client";

export type ApplicationWithRelations = Application & {
  interviews: Interview[];
  tasks: Task[];
  timelineEvents: TimelineEvent[];
  activities: ActivityLog[];
  reminders: Reminder[];
  tags: { tag: Tag }[];
  contacts: { contact: Contact; relationshipToApplication: string | null }[];
  documents: { document: Document; usageType: string | null; notes: string | null }[];
  customStatus: ApplicationStatus | null;
};

export type SelectOption = { label: string; value: string };
