import { Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { getDashboardStats, getUpcomingEvents } from "@/lib/services/dashboard";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { StatusPieChart, MonthlyBarChart } from "@/components/analytics/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";

export default async function DashboardPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const [stats, upcoming] = await Promise.all([getDashboardStats(userId), getUpcomingEvents(userId)]);

  return (
    <PageShell
      title="Dashboard"
      description="Overview of your internship application pipeline"
      actions={
        <div className="flex items-center gap-2">
          <Link href="/applications/new" className={buttonVariants()}>
            <Plus className="mr-1 size-4" />
            Add Application
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        <StatsGrid stats={stats} />

        <div className="grid gap-5 lg:grid-cols-2">
          <StatusPieChart data={stats.statusCounts} />
          <MonthlyBarChart data={stats.monthly} />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-semibold tracking-tight">Upcoming deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
              {upcoming.deadlines.slice(0, 6).map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{deadline.companyName}</span>
                  <span className="text-muted-foreground">{formatDate(deadline.deadline)}</span>
                </div>
              ))}
              {upcoming.deadlines.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming deadlines.</p> : null}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-semibold tracking-tight">Upcoming interviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
              {upcoming.interviews.slice(0, 6).map((interview) => (
                <div key={interview.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{interview.application.companyName}</span>
                  <span className="text-muted-foreground">{formatDate(interview.scheduledAt)}</span>
                </div>
              ))}
              {upcoming.interviews.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming interviews.</p> : null}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-semibold tracking-tight">Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
              {stats.insights.map((insight, idx) => (
                <p key={idx} className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  {insight}
                </p>
              ))}
              {stats.insights.length === 0 ? <p className="text-sm text-muted-foreground">No insights yet.</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
