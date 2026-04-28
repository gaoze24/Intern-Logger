import { PageShell } from "@/components/layout/page-shell";
import { CalendarView } from "@/components/calendar/calendar-view";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getUpcomingEvents } from "@/lib/services/dashboard";

export default async function CalendarPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const upcoming = await getUpcomingEvents(userId);

  const events = [
    ...upcoming.deadlines
      .filter((deadline) => deadline.deadline)
      .map((deadline) => ({
        id: deadline.id,
        title: `${deadline.companyName} deadline`,
        date: deadline.deadline!,
        type: "deadline" as const,
      })),
    ...upcoming.interviews.map((interview) => ({
      id: interview.id,
      title: `${interview.application.companyName} · ${interview.title}`,
      date: interview.scheduledAt,
      type: "interview" as const,
    })),
    ...upcoming.tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: task.id,
        title: task.title,
        date: task.dueDate!,
        type: "task" as const,
      })),
    ...upcoming.reminders.map((reminder) => ({
      id: reminder.id,
      title: reminder.title,
      date: reminder.remindAt,
      type: "reminder" as const,
    })),
  ];

  return (
    <PageShell title="Calendar" description="Deadlines, interviews, reminders, and tasks in one view">
      <CalendarView events={events} />
    </PageShell>
  );
}
