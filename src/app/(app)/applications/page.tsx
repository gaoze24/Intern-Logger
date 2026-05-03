import { Archive, BriefcaseBusiness, Plus, SearchX } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationStatusType } from "@prisma/client";
import { PageShell } from "@/components/layout/page-shell";
import { ApplicationsFilterBar } from "@/components/applications/filter-bar";
import { ApplicationTable } from "@/components/applications/application-table";
import { ApplicationCard } from "@/components/applications/application-card";
import { EmptyState } from "@/components/common/empty-state";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import {
  getApplicationCounts,
  getApplicationsList,
  normalizeApplicationSort,
  normalizeApplicationTab,
} from "@/lib/services/applications";
import { buttonVariants } from "@/components/ui/button";
import { PaginationControls } from "@/components/common/pagination-controls";
import { getModeLabels, isStatusAllowedForMode } from "@/constants/app";
import { getCurrentApplicationMode } from "@/lib/services/settings";

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

function getStatusParam(value: string | undefined, mode: "JOB" | "UNIVERSITY") {
  return value &&
    Object.values(ApplicationStatusType).includes(value as ApplicationStatusType) &&
    isStatusAllowedForMode(value as ApplicationStatusType, mode)
    ? (value as ApplicationStatusType)
    : undefined;
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getCurrentUserIdOrRedirect();
  const mode = await getCurrentApplicationMode(userId);
  const labels = getModeLabels(mode);
  const params = await searchParams;
  const viewParam = getStringParam(params, "view");
  const view = viewParam === "compact" || viewParam === "kanban" ? viewParam : "table";
  if (view === "kanban") redirect("/kanban");
  const tab = normalizeApplicationTab(getStringParam(params, "tab"));
  const statusParam = getStatusParam(getStringParam(params, "status"), mode);
  const status = tab === "active" && statusParam === ApplicationStatusType.ARCHIVED ? undefined : statusParam;
  const search = getStringParam(params, "search");
  const { sort, order } = normalizeApplicationSort(getStringParam(params, "sort"), getStringParam(params, "order"));
  const page = getPageParam(getStringParam(params, "page"));
  const pageSize = getPageSizeParam(getStringParam(params, "pageSize"));
  const statuses = status ? [status] : undefined;

  const [applications, counts] = await Promise.all([
    getApplicationsList(userId, {
      applicationType: mode,
      tab,
      search,
      statuses,
      sort,
      order,
      page,
      pageSize,
    }),
    getApplicationCounts(userId, {
      applicationType: mode,
      search,
      statuses,
    }),
  ]);

  const hasFilters = Boolean(search || status);
  const emptyState =
    applications.items.length === 0 && hasFilters
      ? {
          title: "No matching applications",
          description: "Try changing your search, filters, or archived view.",
          icon: SearchX,
          action: (
            <Link href={`/applications?tab=${tab}`} className={`${buttonVariants({ variant: "outline" })} mt-2`}>
              Clear filters
            </Link>
          ),
        }
      : applications.items.length === 0 && tab === "archived"
        ? {
            title: "No archived applications",
            description: "Archived applications will appear here when you hide them from your active list.",
            icon: Archive,
            action: (
              <Link href="/applications?tab=active" className={`${buttonVariants({ variant: "outline" })} mt-2`}>
                Back to Active
              </Link>
            ),
          }
        : applications.items.length === 0
          ? {
              title: labels.emptyTitle,
              description: labels.emptyDescription,
              icon: BriefcaseBusiness,
              action: (
                <Link href="/applications/new" className={`${buttonVariants()} mt-2`}>
                  <Plus className="mr-1 size-4" />
                  {labels.add}
                </Link>
              ),
            }
          : null;

  const paginationParams = {
    tab,
    search,
    status,
    sort,
    order,
    view,
  };

  return (
    <PageShell
      title={labels.modeLabel}
      description={labels.applicationsDescription}
      actions={
        <Link href="/applications/new" className={buttonVariants()}>
          <Plus className="mr-1 size-4" />
          {labels.add}
        </Link>
      }
    >
      <div className="space-y-5">
        <ApplicationsFilterBar tab={tab} counts={counts} mode={mode} sort={sort} order={order} />
        {emptyState ? (
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
            icon={emptyState.icon}
            action={emptyState.action}
          />
        ) : null}

        {view === "table" && applications.items.length > 0 ? (
          <ApplicationTable applications={applications.items} mode={mode} showArchivedAt={tab !== "active"} />
        ) : null}
        {view === "compact" && applications.items.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {applications.items.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          ) : null}
        <PaginationControls
          basePath="/applications"
          page={applications.page}
          pageSize={applications.pageSize}
          total={applications.total}
          totalPages={applications.totalPages}
          params={paginationParams}
        />
      </div>
    </PageShell>
  );
}
