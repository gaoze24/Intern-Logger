import { PageShell } from "@/components/layout/page-shell";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getAnalyticsSummary, getApplicationFunnel } from "@/lib/services/dashboard";
import { StatusPieChart, MonthlyBarChart, FunnelStatusChart } from "@/components/analytics/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const [summary, funnel] = await Promise.all([getAnalyticsSummary(userId), getApplicationFunnel(userId)]);

  return (
    <PageShell title="Analytics" description="Measure pipeline health and recruiting outcomes">
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <StatusPieChart data={summary.bySource} />
          <MonthlyBarChart data={summary.monthly} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <FunnelStatusChart data={funnel.map((item) => ({ status: item.status, count: item.count }))} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Interview rate: {(summary.conversion.interviewRate * 100).toFixed(1)}%</p>
              <p>Offer rate: {(summary.conversion.offerRate * 100).toFixed(1)}%</p>
              <p>Rejection rate: {(summary.conversion.rejectionRate * 100).toFixed(1)}%</p>
              <div className="pt-2 text-muted-foreground">
                {summary.insights.map((insight, idx) => (
                  <p key={idx}>• {insight}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
