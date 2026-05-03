import { PageShell } from "@/components/layout/page-shell";
import { CalendarView } from "@/components/calendar/calendar-view";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getUpcomingEvents } from "@/lib/services/dashboard";
import { getCurrentApplicationMode } from "@/lib/services/settings";
import { getApplicationPrimaryTitle } from "@/constants/app";

export default async function CalendarPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const mode = await getCurrentApplicationMode(userId);
  const upcoming = await getUpcomingEvents(userId, mode);

  const events = [
    ...upcoming.deadlines
      .filter((deadline) => deadline.deadline)
      .map((deadline) => ({
        id: deadline.id,
        title: `${getApplicationPrimaryTitle(deadline)} deadline`,
        date: deadline.deadline!,
        type: "deadline" as const,
      })),
    ...upcoming.interviews.map((interview) => ({
      id: interview.id,
      title: `${getApplicationPrimaryTitle(interview.application)} · ${interview.title}`,
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
    <PageShell title="Calendar" description="Deadlines, interviews, reminders, and tasks for the selected application mode">
      <CalendarView events={events} />
    </PageShell>
  );
}
