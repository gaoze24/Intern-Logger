import type { ApplicationStatusType, Priority, Source, WorkMode } from "@prisma/client";

export const APP_NAME = "Internship Tracker";

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

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  MEDIUM: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-100",
  HIGH: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  DREAM: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
};

export const PRIORITY_ORDER: Priority[] = ["DREAM", "HIGH", "MEDIUM", "LOW"];
export const WORK_MODES: WorkMode[] = ["ONSITE", "HYBRID", "REMOTE", "UNKNOWN"];
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
