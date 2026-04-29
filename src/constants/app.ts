import type {
  ApplicationStatusType,
  DocumentType,
  InterviewOutcome,
  InterviewType,
  Priority,
  RelationshipType,
  Source,
  TaskPriority,
  TimelineEventType,
  WorkMode,
} from "@prisma/client";

export const APP_NAME = "Internship Tracker";

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const DEFAULT_STATUSES: {
  name: string;
  type: ApplicationStatusType;
  color: string;
  order: number;
  isFinal: boolean;
}[] = [
  { name: "Wishlist", type: "WISHLIST", color: "#64748b", order: 1, isFinal: false },
  { name: "Preparing", type: "PREPARING", color: "#3b82f6", order: 2, isFinal: false },
  { name: "Applied", type: "APPLIED", color: "#0ea5e9", order: 3, isFinal: false },
  { name: "Online Assessment", type: "ONLINE_ASSESSMENT", color: "#6366f1", order: 4, isFinal: false },
  { name: "Recruiter Screen", type: "RECRUITER_SCREEN", color: "#8b5cf6", order: 5, isFinal: false },
  { name: "Technical Interview", type: "TECHNICAL_INTERVIEW", color: "#a855f7", order: 6, isFinal: false },
  { name: "Behavioral Interview", type: "BEHAVIORAL_INTERVIEW", color: "#d946ef", order: 7, isFinal: false },
  { name: "Final Round", type: "FINAL_ROUND", color: "#ec4899", order: 8, isFinal: false },
  { name: "Offer", type: "OFFER", color: "#22c55e", order: 9, isFinal: true },
  { name: "Rejected", type: "REJECTED", color: "#ef4444", order: 10, isFinal: true },
  { name: "Withdrawn", type: "WITHDRAWN", color: "#f97316", order: 11, isFinal: true },
  { name: "Archived", type: "ARCHIVED", color: "#6b7280", order: 12, isFinal: true },
];

export const STATUS_LABELS: Record<ApplicationStatusType, string> = {
  WISHLIST: "Wishlist",
  PREPARING: "Preparing",
  APPLIED: "Applied",
  ONLINE_ASSESSMENT: "Online Assessment",
  RECRUITER_SCREEN: "Recruiter Screen",
  TECHNICAL_INTERVIEW: "Technical Interview",
  BEHAVIORAL_INTERVIEW: "Behavioral Interview",
  FINAL_ROUND: "Final Round",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  ARCHIVED: "Archived",
  CUSTOM: "Custom",
};

export const APPLICATION_STATUS_OPTIONS: { value: ApplicationStatusType; label: string }[] =
  Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value: value as ApplicationStatusType,
    label,
  }));

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  MEDIUM: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-100",
  HIGH: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  DREAM: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
};

export const PRIORITY_ORDER: Priority[] = ["DREAM", "HIGH", "MEDIUM", "LOW"];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  DREAM: "Dream",
};

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = (
  ["LOW", "MEDIUM", "HIGH", "DREAM"] as Priority[]
).map((value) => ({ value, label: PRIORITY_LABELS[value] }));

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = (
  ["LOW", "MEDIUM", "HIGH", "URGENT"] as TaskPriority[]
).map((value) => ({ value, label: TASK_PRIORITY_LABELS[value] }));

export const WORK_MODES: WorkMode[] = ["ONSITE", "HYBRID", "REMOTE", "UNKNOWN"];

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  ONSITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
  UNKNOWN: "Unknown",
};

export const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = WORK_MODES.map((value) => ({
  value,
  label: WORK_MODE_LABELS[value],
}));

export const SOURCES: Source[] = [
  "LINKEDIN",
  "COMPANY_WEBSITE",
  "REFERRAL",
  "CAREER_FAIR",
  "RECRUITER",
  "UNIVERSITY_PORTAL",
  "EMAIL",
  "OTHER",
];

export const SOURCE_LABELS: Record<Source, string> = {
  LINKEDIN: "LinkedIn",
  COMPANY_WEBSITE: "Company Website",
  REFERRAL: "Referral",
  CAREER_FAIR: "Career Fair",
  RECRUITER: "Recruiter",
  UNIVERSITY_PORTAL: "University Portal",
  EMAIL: "Email",
  OTHER: "Other",
};

export const APPLICATION_SOURCE_OPTIONS: { value: Source; label: string }[] = SOURCES.map((value) => ({
  value,
  label: SOURCE_LABELS[value],
}));

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  OA: "Online Assessment",
  PHONE_SCREEN: "Recruiter Screen",
  HR_INTERVIEW: "HR Interview",
  TECHNICAL_INTERVIEW: "Technical Interview",
  BEHAVIORAL_INTERVIEW: "Behavioral Interview",
  CASE_INTERVIEW: "Case Interview",
  FINAL_ROUND: "Final Round",
  TAKE_HOME: "Take-home Assignment",
  GROUP_INTERVIEW: "Group Interview",
  OTHER: "Other",
};

export const INTERVIEW_TYPE_OPTIONS: { value: InterviewType; label: string }[] = (
  [
    "OA",
    "PHONE_SCREEN",
    "TECHNICAL_INTERVIEW",
    "BEHAVIORAL_INTERVIEW",
    "CASE_INTERVIEW",
    "FINAL_ROUND",
    "TAKE_HOME",
    "GROUP_INTERVIEW",
    "OTHER",
  ] as InterviewType[]
).map((value) => ({ value, label: INTERVIEW_TYPE_LABELS[value] }));

export const INTERVIEW_OUTCOME_LABELS: Record<InterviewOutcome, string> = {
  PENDING: "Scheduled",
  PASSED: "Passed",
  FAILED: "Failed",
  NO_SHOW: "No-show",
  CANCELED: "Cancelled",
};

export const INTERVIEW_OUTCOME_OPTIONS: { value: InterviewOutcome; label: string }[] = (
  ["PENDING", "PASSED", "FAILED", "NO_SHOW", "CANCELED"] as InterviewOutcome[]
).map((value) => ({ value, label: INTERVIEW_OUTCOME_LABELS[value] }));

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  RESUME: "Resume",
  COVER_LETTER: "Cover Letter",
  TRANSCRIPT: "Transcript",
  PORTFOLIO: "Portfolio",
  GITHUB: "GitHub",
  WEBSITE: "Personal Website",
  WRITING_SAMPLE: "Writing Sample",
  OTHER: "Other",
};

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = (
  [
    "RESUME",
    "COVER_LETTER",
    "TRANSCRIPT",
    "PORTFOLIO",
    "GITHUB",
    "WEBSITE",
    "WRITING_SAMPLE",
    "OTHER",
  ] as DocumentType[]
).map((value) => ({ value, label: DOCUMENT_TYPE_LABELS[value] }));

export const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  RECRUITER: "Recruiter",
  ALUMNI: "Alumni",
  REFERRAL: "Referral",
  INTERVIEWER: "Interviewer",
  HIRING_MANAGER: "Hiring Manager",
  EMPLOYEE: "Employee",
  FRIEND: "Friend",
  OTHER: "Other",
};

export const RELATIONSHIP_TYPE_OPTIONS: { value: RelationshipType; label: string }[] = (
  [
    "RECRUITER",
    "HIRING_MANAGER",
    "INTERVIEWER",
    "REFERRAL",
    "ALUMNI",
    "EMPLOYEE",
    "FRIEND",
    "OTHER",
  ] as RelationshipType[]
).map((value) => ({ value, label: RELATIONSHIP_TYPE_LABELS[value] }));

export const TIMELINE_EVENT_TYPE_LABELS: Record<TimelineEventType, string> = {
  DISCOVERED: "Discovered",
  PREPARATION_STARTED: "Preparation Started",
  APPLIED: "Applied",
  OA_RECEIVED: "OA Received",
  OA_SUBMITTED: "OA Submitted",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  INTERVIEW_COMPLETED: "Interview Completed",
  OFFER_RECEIVED: "Offer Received",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  FOLLOW_UP_SENT: "Follow-up Sent",
  STATUS_CHANGED: "Status Changed",
  NOTE_ADDED: "Note Added",
};

export const TIMELINE_EVENT_TYPE_OPTIONS: { value: TimelineEventType; label: string }[] = (
  [
    "NOTE_ADDED",
    "FOLLOW_UP_SENT",
    "OA_SUBMITTED",
    "INTERVIEW_COMPLETED",
    "STATUS_CHANGED",
    "APPLIED",
  ] as TimelineEventType[]
).map((value) => ({ value, label: TIMELINE_EVENT_TYPE_LABELS[value] }));

export const DOCUMENT_USAGE_OPTIONS = [
  "Submitted Resume",
  "Submitted Cover Letter",
  "Supporting Document",
  "Portfolio Link",
  "Reference",
  "Other",
] as const;
