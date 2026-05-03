import type { ApplicationStatusType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/constants/app";

const STATUS_STYLES: Record<ApplicationStatusType, string> = {
  WISHLIST: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  RESEARCHING: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  PREPARING: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
  DOCUMENTS_PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  APPLIED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-100",
  SUBMITTED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-100",
  UNDER_REVIEW: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100",
  ONLINE_ASSESSMENT: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100",
  RECRUITER_SCREEN: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-100",
  TECHNICAL_INTERVIEW: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100",
  BEHAVIORAL_INTERVIEW: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-100",
  FINAL_ROUND: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-100",
  INTERVIEW: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100",
  WAITLISTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  OFFER: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100",
  ACCEPTED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
  DEFERRED: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-100",
  WITHDRAWN: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100",
  ARCHIVED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
  CUSTOM: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
};

export function StatusBadge({ status }: { status: ApplicationStatusType }) {
  return <Badge className={STATUS_STYLES[status]}>{STATUS_LABELS[status]}</Badge>;
}
