import { PageShell } from "@/components/layout/page-shell";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getKanbanApplications } from "@/lib/services/applications";

export default async function KanbanPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const applications = await getKanbanApplications(userId);

  return (
    <PageShell title="Kanban pipeline" description="Move applications across your recruiting stages">
      <KanbanBoard applications={applications} />
    </PageShell>
  );
}
