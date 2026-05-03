import { PageShell } from "@/components/layout/page-shell";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getKanbanApplicationsByMode } from "@/lib/services/applications";
import { getCurrentApplicationMode } from "@/lib/services/settings";
import { getModeLabels } from "@/constants/app";

export default async function KanbanPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const mode = await getCurrentApplicationMode(userId);
  const labels = getModeLabels(mode);
  const applications = await getKanbanApplicationsByMode(userId, mode);

  return (
    <PageShell title="Kanban pipeline" description={`Move ${labels.modeLabel.toLowerCase()} across their stages`}>
      <KanbanBoard applications={applications} mode={mode} />
    </PageShell>
  );
}
