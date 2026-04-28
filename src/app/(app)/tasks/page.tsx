import { PageShell } from "@/components/layout/page-shell";
import { TaskList } from "@/components/tasks/task-list";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getTasks } from "@/lib/services/entities";

export default async function TasksPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const tasks = await getTasks(userId);

  return (
    <PageShell title="Tasks" description="Global tasks across all internship applications">
      <TaskList tasks={tasks} />
    </PageShell>
  );
}
