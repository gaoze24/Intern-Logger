"use client";

import dynamic from "next/dynamic";
import { AnalyticsChartCard } from "@/components/analytics/chart-card";
import { Skeleton } from "@/components/ui/skeleton";

type StatusPieChartProps = { data: Record<string, number> };
type MonthlyBarChartProps = { data: Record<string, number> };
type FunnelStatusChartProps = { data: { status: string; count: number }[] };

function ChartSkeleton({ title }: { title: string }) {
  return (
    <AnalyticsChartCard title={title}>
      <div className="h-72 space-y-4">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    </AnalyticsChartCard>
  );
}

const StatusPieChartImpl = dynamic(
  () => import("@/components/analytics/charts-client").then((mod) => mod.StatusPieChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton title="Applications by status" />,
  },
);

const MonthlyBarChartImpl = dynamic(
  () => import("@/components/analytics/charts-client").then((mod) => mod.MonthlyBarChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton title="Applications over time" />,
  },
);

const FunnelStatusChartImpl = dynamic(
  () => import("@/components/analytics/charts-client").then((mod) => mod.FunnelStatusChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton title="Status funnel" />,
  },
);

export function StatusPieChart(props: StatusPieChartProps) {
  return <StatusPieChartImpl {...props} />;
}

export function MonthlyBarChart(props: MonthlyBarChartProps) {
  return <MonthlyBarChartImpl {...props} />;
}

export function FunnelStatusChart(props: FunnelStatusChartProps) {
  return <FunnelStatusChartImpl {...props} />;
}
