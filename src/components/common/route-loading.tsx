import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function MetricGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="space-y-3 p-6 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-20" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="p-6 pb-3">
            <Skeleton className="h-6 w-44" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Skeleton className="h-72 w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="grid grid-cols-5 gap-4 border-b p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className="grid grid-cols-5 gap-4 p-4">
            {Array.from({ length: 5 }).map((_, column) => (
              <Skeleton key={column} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="space-y-3 pb-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DashboardLoading() {
  return (
    <PageShell title="Dashboard" description="Overview of your application pipeline">
      <div className="space-y-5">
        <MetricGridSkeleton />
        <ChartGridSkeleton />
        <CardGridSkeleton count={3} />
      </div>
    </PageShell>
  );
}

export function ApplicationsLoading() {
  return (
    <PageShell title="Applications" description="Track, filter, and manage your applications">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-10 w-48" />
        </div>
        <TableSkeleton />
      </div>
    </PageShell>
  );
}

export function KanbanLoading() {
  return (
    <PageShell title="Kanban pipeline" description="Move applications across your recruiting stages">
      <div className="grid min-w-max grid-cols-4 gap-4 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="w-80 shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

export function CalendarLoading() {
  return (
    <PageShell title="Calendar" description="Deadlines, interviews, reminders, and tasks in one view">
      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <Skeleton className="h-[360px] w-full rounded-xl lg:w-[340px]" />
        <Card className="shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export function TasksLoading() {
  return (
    <PageShell title="Tasks" description="Global tasks across your selected application mode">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </PageShell>
  );
}

export function ContactsLoading() {
  return (
    <PageShell title="Contacts / Networking" description="Track people connected to your applications">
      <div className="space-y-5">
        <Skeleton className="h-10 w-80" />
        <CardGridSkeleton />
      </div>
    </PageShell>
  );
}

export function DocumentsLoading() {
  return (
    <PageShell title="Documents" description="Track documents and supporting links">
      <CardGridSkeleton />
    </PageShell>
  );
}

export function AnalyticsLoading() {
  return (
    <PageShell title="Analytics" description="Measure pipeline health and recruiting outcomes">
      <div className="space-y-5">
        <ChartGridSkeleton />
        <ChartGridSkeleton />
      </div>
    </PageShell>
  );
}

export function EmailTemplatesLoading() {
  return (
    <PageShell title="Email templates" description="Generate editable, copyable career communication templates">
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-[520px] w-full rounded-xl" />
        <Skeleton className="h-[520px] w-full rounded-xl" />
      </div>
    </PageShell>
  );
}

export function SettingsLoading() {
  return (
    <PageShell title="Settings" description="Profile, preferences, and data controls">
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    </PageShell>
  );
}
