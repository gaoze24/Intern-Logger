import { Plus } from "lucide-react";
import Link from "next/link";
import { ApplicationStatusType } from "@prisma/client";
import { PageShell } from "@/components/layout/page-shell";
import { ApplicationsFilterBar } from "@/components/applications/filter-bar";
import { ApplicationTable } from "@/components/applications/application-table";
import { ApplicationCard } from "@/components/applications/application-card";
import { EmptyState } from "@/components/common/empty-state";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getApplicationsList } from "@/lib/services/applications";
import { buttonVariants } from "@/components/ui/button";
import { BriefcaseBusiness } from "lucide-react";
import { PaginationControls } from "@/components/common/pagination-controls";

const VALID_PAGE_SIZES = new Set([25, 50, 100]);

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
}

function getPageParam(value: string | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getPageSizeParam(value: string | undefined) {
  const pageSize = Number(value);
  return VALID_PAGE_SIZES.has(pageSize) ? pageSize : 25;
}

function getStatusParam(value: string | undefined) {
  return value && Object.values(ApplicationStatusType).includes(value as ApplicationStatusType)
    ? (value as ApplicationStatusType)
    : undefined;
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getCurrentUserIdOrRedirect();
  const params = await searchParams;
  const viewParam = getStringParam(params, "view");
  const view = viewParam === "compact" || viewParam === "kanban" ? viewParam : "table";
  const status = getStatusParam(getStringParam(params, "status"));
  const search = getStringParam(params, "search");
  const page = getPageParam(getStringParam(params, "page"));
  const pageSize = getPageSizeParam(getStringParam(params, "pageSize"));

  const applications = await getApplicationsList(userId, {
    search,
    statuses: status ? [status] : undefined,
    page,
    pageSize,
  });

  return (
    <PageShell
      title="Applications"
      description="Track, filter, and manage your internship applications"
      actions={
        <Link href="/applications/new" className={buttonVariants()}>
          <Plus className="mr-1 size-4" />
          Add Application
        </Link>
      }
    >
      <div className="space-y-5">
        <ApplicationsFilterBar />
        {applications.items.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Add your first internship application to start tracking deadlines, interviews, and tasks."
            icon={BriefcaseBusiness}
            action={
              <Link href="/applications/new" className={`${buttonVariants()} mt-2`}>
                <Plus className="mr-1 size-4" />
                Add application
              </Link>
            }
          />
        ) : null}

        {view === "table" && applications.items.length > 0 ? <ApplicationTable applications={applications.items} /> : null}
        {view === "compact" && applications.items.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {applications.items.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          ) : null}
        {view === "kanban" && applications.items.length > 0 ? (
          <div className="text-[15px] text-muted-foreground">Use the dedicated Kanban page for drag-and-drop workflow.</div>
        ) : null}
        <PaginationControls
          basePath="/applications"
          page={applications.page}
          pageSize={applications.pageSize}
          total={applications.total}
          totalPages={applications.totalPages}
          params={{ search, status, view }}
        />
      </div>
    </PageShell>
  );
}
