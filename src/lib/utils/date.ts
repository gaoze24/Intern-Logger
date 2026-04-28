import { differenceInCalendarDays, endOfWeek, format, isBefore, isToday, startOfToday } from "date-fns";

export type DeadlineUrgency = "overdue" | "today" | "in3days" | "thisWeek" | "future" | "none";
export type StatusHealth = "fresh" | "waiting" | "stale" | "urgent" | "closed";

export function getDeadlineUrgency(deadline?: Date | null): DeadlineUrgency {
  if (!deadline) return "none";
  const today = startOfToday();
  if (isBefore(deadline, today)) return "overdue";
  if (isToday(deadline)) return "today";
  const diff = differenceInCalendarDays(deadline, today);
  if (diff <= 3) return "in3days";
  if (deadline <= endOfWeek(today, { weekStartsOn: 1 })) return "thisWeek";
  return "future";
}

export function getStatusHealth(updatedAt: Date, isFinal: boolean): StatusHealth {
  if (isFinal) return "closed";
  const days = Math.max(0, differenceInCalendarDays(new Date(), updatedAt));
  if (days <= 3) return "fresh";
  if (days <= 10) return "waiting";
  if (days <= 20) return "stale";
  return "urgent";
}

export function formatDate(value?: Date | null, pattern = "MMM d, yyyy") {
  if (!value) return "—";
  return format(value, pattern);
}
