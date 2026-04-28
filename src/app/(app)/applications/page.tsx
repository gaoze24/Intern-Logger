import { Plus } from "lucide-react";
import Link from "next/link";
import { ApplicationStatusType } from "@prisma/client";
import { PageShell } from "@/components/layout/page-shell";
import { ApplicationsFilterBar } from "@/components/applications/filter-bar";
import { ApplicationTable } from "@/components/applications/application-table";
import { ApplicationCard } from "@/components/applications/application-card";
import { EmptyState } from "@/components/common/empty-state";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getApplications } from "@/lib/services/applications";
import { buttonVariants } from "@/components/ui/button";
import { BriefcaseBusiness } from "lucide-react";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getCurrentUserIdOrRedirect();
  const params = await searchParams;
  const view = typeof params.view === "string" ? params.view : "table";
  const status = typeof params.status === "string" ? params.status : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;

  const applications = await getApplications(userId, {
    search,
    statuses: status ? [status as ApplicationStatusType] : undefined,
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
      <div className="space-y-4">
        <ApplicationsFilterBar />
        {applications.length === 0 ? (
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

        {view === "table" && applications.length > 0 ? <ApplicationTable applications={applications} /> : null}
        {view === "compact" && applications.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        ) : null}
        {view === "kanban" && applications.length > 0 ? (
          <div className="text-sm text-muted-foreground">Use the dedicated Kanban page for drag-and-drop workflow.</div>
        ) : null}
      </div>
    </PageShell>
  );
}
