import type {
  ApplicationStatusType,
  ApplicationType,
  DegreeLevel,
  DocumentType,
  IntakeTerm,
  InterviewOutcome,
  InterviewType,
  Priority,
  RelationshipType,
  Source,
  TaskPriority,
  TimelineEventType,
  WorkMode,
} from "@prisma/client";

export const APP_NAME = "Application Tracker";
export type ApplicationMode = ApplicationType;

export const APPLICATION_MODES: { value: ApplicationMode; label: string; shortLabel: string; description: string }[] = [
  {
    value: "JOB",
    label: "Job Applications",
    shortLabel: "Job",
    description: "Track internships, full-time roles, interviews, offers, and recruiting tasks.",
  },
  {
    value: "UNIVERSITY",
    label: "University Applications",
    shortLabel: "University",
    description: "Track schools, programs, documents, admissions deadlines, and decisions.",
  },
];

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

export const JOB_STATUS_OPTIONS: { value: ApplicationStatusType; label: string }[] = [
  { value: "WISHLIST", label: "Wishlist" },
  { value: "PREPARING", label: "Preparing" },
  { value: "APPLIED", label: "Applied" },
  { value: "ONLINE_ASSESSMENT", label: "Online Assessment" },
  { value: "RECRUITER_SCREEN", label: "Recruiter Screen" },
  { value: "TECHNICAL_INTERVIEW", label: "Technical Interview" },
  { value: "BEHAVIORAL_INTERVIEW", label: "Behavioral Interview" },
  { value: "FINAL_ROUND", label: "Final Round" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "ARCHIVED", label: "Archived" },
];

export const UNIVERSITY_STATUS_OPTIONS: { value: ApplicationStatusType; label: string }[] = [
  { value: "RESEARCHING", label: "Researching" },
  { value: "PREPARING", label: "Preparing" },
  { value: "DOCUMENTS_PENDING", label: "Documents Pending" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "WAITLISTED", label: "Waitlisted" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DEFERRED", label: "Deferred" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "ARCHIVED", label: "Archived" },
];

export const STATUS_LABELS: Record<ApplicationStatusType, string> = {
  WISHLIST: "Wishlist",
  RESEARCHING: "Researching",
  PREPARING: "Preparing",
  DOCUMENTS_PENDING: "Documents Pending",
  APPLIED: "Applied",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ONLINE_ASSESSMENT: "Online Assessment",
  RECRUITER_SCREEN: "Recruiter Screen",
  TECHNICAL_INTERVIEW: "Technical Interview",
  BEHAVIORAL_INTERVIEW: "Behavioral Interview",
  FINAL_ROUND: "Final Round",
  INTERVIEW: "Interview",
  WAITLISTED: "Waitlisted",
  OFFER: "Offer",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  DEFERRED: "Deferred",
  WITHDRAWN: "Withdrawn",
  ARCHIVED: "Archived",
  CUSTOM: "Custom",
};

export const APPLICATION_STATUS_OPTIONS: { value: ApplicationStatusType; label: string }[] = Object.entries(
  STATUS_LABELS,
).map(([value, label]) => ({
  value: value as ApplicationStatusType,
  label,
}));

export function getStatusOptions(mode: ApplicationMode) {
  return mode === "UNIVERSITY" ? UNIVERSITY_STATUS_OPTIONS : JOB_STATUS_OPTIONS;
}

export function isStatusAllowedForMode(status: ApplicationStatusType, mode: ApplicationMode) {
  return getStatusOptions(mode).some((option) => option.value === status);
}

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

export const SOURCE_LABELS: Record<Source, string> = {
  LINKEDIN: "LinkedIn",
  COMPANY_WEBSITE: "Company Website",
  REFERRAL: "Referral",
  CAREER_FAIR: "Career Fair",
  RECRUITER: "Recruiter",
  UNIVERSITY_PORTAL: "University Portal",
  UNIVERSITY_WEBSITE: "University Website",
  COMMON_APP: "Common App",
  UCAS: "UCAS",
  GRAD_PORTAL: "Grad Portal",
  AGENT_CONSULTANT: "Agent/Consultant",
  PROFESSOR: "Professor",
  ALUMNI: "Alumni",
  EDUCATION_FAIR: "Education Fair",
  EMAIL: "Email",
  OTHER: "Other",
};

export const SOURCES: Source[] = Object.keys(SOURCE_LABELS) as Source[];

export const APPLICATION_SOURCE_OPTIONS: { value: Source; label: string }[] = SOURCES.map((value) => ({
  value,
  label: SOURCE_LABELS[value],
}));

export const JOB_SOURCE_OPTIONS: { value: Source; label: string }[] = (
  ["LINKEDIN", "COMPANY_WEBSITE", "REFERRAL", "CAREER_FAIR", "RECRUITER", "UNIVERSITY_PORTAL", "EMAIL", "OTHER"] as Source[]
).map((value) => ({ value, label: SOURCE_LABELS[value] }));

export const UNIVERSITY_SOURCE_OPTIONS: { value: Source; label: string }[] = (
  [
    "UNIVERSITY_WEBSITE",
    "COMMON_APP",
    "UCAS",
    "GRAD_PORTAL",
    "AGENT_CONSULTANT",
    "PROFESSOR",
    "ALUMNI",
    "EDUCATION_FAIR",
    "EMAIL",
    "OTHER",
  ] as Source[]
).map((value) => ({ value, label: SOURCE_LABELS[value] }));

export function getSourceOptions(mode: ApplicationMode) {
  return mode === "UNIVERSITY" ? UNIVERSITY_SOURCE_OPTIONS : JOB_SOURCE_OPTIONS;
}

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
  CERTIFICATE: "Certificate",
  PERSONAL_STATEMENT: "Personal Statement",
  STATEMENT_OF_PURPOSE: "Statement of Purpose",
  RECOMMENDATION_LETTER: "Recommendation Letter",
  TEST_SCORE: "Test Score",
  RESEARCH_PROPOSAL: "Research Proposal",
  PASSPORT: "Passport",
  FINANCIAL_DOCUMENT: "Financial Document",
  SCHOLARSHIP_ESSAY: "Scholarship Essay",
  OTHER: "Other",
};

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = (
  Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]
).map((value) => ({ value, label: DOCUMENT_TYPE_LABELS[value] }));

export const JOB_DOCUMENT_TYPES: { value: DocumentType; label: string }[] = (
  ["RESUME", "COVER_LETTER", "TRANSCRIPT", "PORTFOLIO", "GITHUB", "WEBSITE", "WRITING_SAMPLE", "CERTIFICATE", "OTHER"] as DocumentType[]
).map((value) => ({ value, label: DOCUMENT_TYPE_LABELS[value] }));

export const UNIVERSITY_DOCUMENT_TYPES: { value: DocumentType; label: string }[] = (
  [
    "PERSONAL_STATEMENT",
    "STATEMENT_OF_PURPOSE",
    "RESUME",
    "TRANSCRIPT",
    "RECOMMENDATION_LETTER",
    "TEST_SCORE",
    "PORTFOLIO",
    "WRITING_SAMPLE",
    "RESEARCH_PROPOSAL",
    "PASSPORT",
    "FINANCIAL_DOCUMENT",
    "SCHOLARSHIP_ESSAY",
    "OTHER",
  ] as DocumentType[]
).map((value) => ({ value, label: DOCUMENT_TYPE_LABELS[value] }));

export function getDocumentTypeOptions(mode: ApplicationMode) {
  return mode === "UNIVERSITY" ? UNIVERSITY_DOCUMENT_TYPES : JOB_DOCUMENT_TYPES;
}

export const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  RECRUITER: "Recruiter",
  ALUMNI: "Alumni",
  REFERRAL: "Referral",
  INTERVIEWER: "Interviewer",
  HIRING_MANAGER: "Hiring Manager",
  EMPLOYEE: "Employee",
  FRIEND: "Friend",
  ADMISSIONS_OFFICER: "Admissions Officer",
  PROFESSOR: "Professor",
  POTENTIAL_SUPERVISOR: "Potential Supervisor",
  PROGRAM_COORDINATOR: "Program Coordinator",
  CURRENT_STUDENT: "Current Student",
  RECOMMENDER: "Recommender",
  AGENT_CONSULTANT: "Agent/Consultant",
  OTHER: "Other",
};

export const RELATIONSHIP_TYPE_OPTIONS: { value: RelationshipType; label: string }[] = (
  Object.keys(RELATIONSHIP_TYPE_LABELS) as RelationshipType[]
).map((value) => ({ value, label: RELATIONSHIP_TYPE_LABELS[value] }));

export const JOB_RELATIONSHIP_TYPE_OPTIONS: { value: RelationshipType; label: string }[] = (
  ["RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "REFERRAL", "ALUMNI", "EMPLOYEE", "FRIEND", "OTHER"] as RelationshipType[]
).map((value) => ({ value, label: RELATIONSHIP_TYPE_LABELS[value] }));

export const UNIVERSITY_RELATIONSHIP_TYPE_OPTIONS: { value: RelationshipType; label: string }[] = (
  [
    "ADMISSIONS_OFFICER",
    "PROFESSOR",
    "POTENTIAL_SUPERVISOR",
    "PROGRAM_COORDINATOR",
    "ALUMNI",
    "CURRENT_STUDENT",
    "RECOMMENDER",
    "AGENT_CONSULTANT",
    "OTHER",
  ] as RelationshipType[]
).map((value) => ({ value, label: RELATIONSHIP_TYPE_LABELS[value] }));

export function getRelationshipTypeOptions(mode: ApplicationMode) {
  return mode === "UNIVERSITY" ? UNIVERSITY_RELATIONSHIP_TYPE_OPTIONS : JOB_RELATIONSHIP_TYPE_OPTIONS;
}

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

export const JOB_DOCUMENT_USAGE_OPTIONS = DOCUMENT_USAGE_OPTIONS;

export const UNIVERSITY_DOCUMENT_USAGE_OPTIONS = [
  "Required Document",
  "Submitted Document",
  "Optional Supplement",
  "Recommendation",
  "Test Score",
  "Scholarship Material",
  "Other",
] as const;

export const DEGREE_LEVEL_LABELS: Record<DegreeLevel, string> = {
  UNDERGRADUATE: "Undergraduate",
  MASTERS: "Master's",
  PHD: "PhD",
  MBA: "MBA",
  EXCHANGE: "Exchange",
  TRANSFER: "Transfer",
  CERTIFICATE: "Certificate",
  OTHER: "Other",
};

export const DEGREE_LEVEL_OPTIONS: { value: DegreeLevel; label: string }[] = (
  ["UNDERGRADUATE", "MASTERS", "PHD", "MBA", "EXCHANGE", "TRANSFER", "CERTIFICATE", "OTHER"] as DegreeLevel[]
).map((value) => ({ value, label: DEGREE_LEVEL_LABELS[value] }));

export const INTAKE_TERM_LABELS: Record<IntakeTerm, string> = {
  FALL: "Fall",
  SPRING: "Spring",
  SUMMER: "Summer",
  WINTER: "Winter",
  ROLLING: "Rolling",
  OTHER: "Other",
};

export const INTAKE_TERM_OPTIONS: { value: IntakeTerm; label: string }[] = (
  ["FALL", "SPRING", "SUMMER", "WINTER", "ROLLING", "OTHER"] as IntakeTerm[]
).map((value) => ({ value, label: INTAKE_TERM_LABELS[value] }));

export function getModeLabels(mode: ApplicationMode) {
  if (mode === "UNIVERSITY") {
    return {
      modeLabel: "University Applications",
      single: "University Application",
      add: "Add University Application",
      emptyTitle: "No university applications yet",
      emptyDescription: "Add a school or program to start tracking deadlines, documents, and admissions decisions.",
      dashboardDescription: "Overview of your university application pipeline",
      applicationsDescription: "Track, filter, and manage your university applications",
      searchPlaceholder: "Search institution, program, country, notes...",
      primaryField: "Institution",
      secondaryField: "Program",
      submittedField: "Submitted",
      acceptedMetric: "Accepted",
      rejectedMetric: "Rejected",
    };
  }

  return {
    modeLabel: "Job Applications",
    single: "Job Application",
    add: "Add Job Application",
    emptyTitle: "No job applications yet",
    emptyDescription: "Add your first job, internship, or graduate scheme application to start tracking your pipeline.",
    dashboardDescription: "Overview of your job application pipeline",
    applicationsDescription: "Track, filter, and manage your job applications",
    searchPlaceholder: "Search company, role, notes, recruiter...",
    primaryField: "Company",
    secondaryField: "Role",
    submittedField: "Applied",
    acceptedMetric: "Offers",
    rejectedMetric: "Rejections",
  };
}

type DisplayApplication = {
  applicationType?: ApplicationMode;
  companyName?: string | null;
  roleTitle?: string | null;
  jobDetail?: { companyName?: string | null; roleTitle?: string | null } | null;
  universityDetail?: { institutionName?: string | null; programName?: string | null } | null;
};

export function getApplicationPrimaryTitle(application: DisplayApplication) {
  if (application.applicationType === "UNIVERSITY") {
    return application.universityDetail?.institutionName ?? application.companyName ?? "Untitled institution";
  }

  return application.jobDetail?.companyName ?? application.companyName ?? "Untitled company";
}

export function getApplicationSecondaryTitle(application: DisplayApplication) {
  if (application.applicationType === "UNIVERSITY") {
    return application.universityDetail?.programName ?? application.roleTitle ?? "Untitled program";
  }

  return application.jobDetail?.roleTitle ?? application.roleTitle ?? "Untitled role";
}

export function getApplicationDisplayName(application: DisplayApplication) {
  return `${getApplicationPrimaryTitle(application)} · ${getApplicationSecondaryTitle(application)}`;
}
