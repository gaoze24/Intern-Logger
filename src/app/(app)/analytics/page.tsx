import { PageShell } from "@/components/layout/page-shell";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getAnalyticsSummary, getApplicationFunnel } from "@/lib/services/dashboard";
import { getCurrentApplicationMode } from "@/lib/services/settings";
import { getModeLabels } from "@/constants/app";
import { StatusPieChart, MonthlyBarChart, FunnelStatusChart } from "@/components/analytics/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const mode = await getCurrentApplicationMode(userId);
  const labels = getModeLabels(mode);
  const [summary, funnel] = await Promise.all([getAnalyticsSummary(userId, mode), getApplicationFunnel(userId, mode)]);

  return (
    <PageShell title="Analytics" description={`Measure pipeline health for your ${labels.modeLabel.toLowerCase()}`}>
      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <StatusPieChart data={summary.bySource} />
          <MonthlyBarChart data={summary.monthly} />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <FunnelStatusChart data={funnel.map((item) => ({ status: item.status, count: item.count }))} />
          <Card className="shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-semibold tracking-tight">Performance metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-6 pb-6">
              <p>Interview rate: {(summary.conversion.interviewRate * 100).toFixed(1)}%</p>
              <p>{mode === "UNIVERSITY" ? "Acceptance" : "Offer"} rate: {(summary.conversion.offerRate * 100).toFixed(1)}%</p>
              <p>Rejection rate: {(summary.conversion.rejectionRate * 100).toFixed(1)}%</p>
              <div className="pt-3 text-sm text-muted-foreground">
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
