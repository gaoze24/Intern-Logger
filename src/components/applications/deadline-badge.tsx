import { Badge } from "@/components/ui/badge";
import { formatDate, getDeadlineUrgency } from "@/lib/utils/date";

export function DeadlineBadge({ deadline }: { deadline?: Date | null }) {
  const urgency = getDeadlineUrgency(deadline);
  const style =
    urgency === "overdue"
      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
      : urgency === "today"
        ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100"
        : urgency === "in3days"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-100"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100";
  return <Badge className={style}>{formatDate(deadline)}</Badge>;
}
