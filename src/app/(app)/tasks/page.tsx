import { PageShell } from "@/components/layout/page-shell";
import { TaskList } from "@/components/tasks/task-list";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getTasks } from "@/lib/services/entities";
import { getCurrentApplicationMode } from "@/lib/services/settings";
import { getModeLabels } from "@/constants/app";
import { PaginationControls } from "@/components/common/pagination-controls";

const VALID_PAGE_SIZES = new Set([25, 50, 100]);

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
}

function getPage(value: string | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getPageSize(value: string | undefined) {
  const pageSize = Number(value);
  return VALID_PAGE_SIZES.has(pageSize) ? pageSize : 25;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getCurrentUserIdOrRedirect();
  const mode = await getCurrentApplicationMode(userId);
  const labels = getModeLabels(mode);
  const params = await searchParams;
  const tasks = await getTasks(userId, {
    applicationType: mode,
    page: getPage(getParam(params, "page")),
    pageSize: getPageSize(getParam(params, "pageSize")),
  });

  return (
    <PageShell title="Tasks" description={`Tasks for your ${labels.modeLabel.toLowerCase()}`}>
      <div className="space-y-5">
        <TaskList tasks={tasks.items} />
        <PaginationControls
          basePath="/tasks"
          page={tasks.page}
          pageSize={tasks.pageSize}
          total={tasks.total}
          totalPages={tasks.totalPages}
        />
      </div>
    </PageShell>
  );
}
