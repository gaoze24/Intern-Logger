"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Funnel,
  FunnelChart,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsChartCard } from "@/components/analytics/chart-card";
import { EmptyState } from "@/components/common/empty-state";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

export function StatusPieChart({ data }: { data: Record<string, number> }) {
  const rows = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
  return (
    <AnalyticsChartCard title="Applications by status">
      {rows.length === 0 ? (
        <EmptyState
          title="No status data yet"
          description="Add applications to see how your pipeline is distributed across stages."
          icon={PieChartIcon}
        />
      ) : (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" outerRadius={90} fill="#64748b" />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      )}
    </AnalyticsChartCard>
  );
}

export function MonthlyBarChart({ data }: { data: Record<string, number> }) {
  const rows = Object.entries(data)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <AnalyticsChartCard title="Applications over time">
      {rows.length === 0 ? (
        <EmptyState
          title="No timeline data yet"
          description="Tracked application activity will appear here month by month."
          icon={BarChart3}
        />
      ) : (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
    </AnalyticsChartCard>
  );
}

export function FunnelStatusChart({ data }: { data: { status: string; count: number }[] }) {
  const rows = data.filter((item) => item.count > 0);
  return (
    <AnalyticsChartCard title="Status funnel">
      {rows.length === 0 ? (
        <EmptyState
          title="No funnel data yet"
          description="Your progression between statuses will appear once applications move through stages."
          icon={BarChart3}
        />
      ) : (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel dataKey="count" data={rows} isAnimationActive nameKey="status" fill="#8b5cf6">
              <LabelList position="right" fill="#64748b" stroke="none" dataKey="status" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
      )}
    </AnalyticsChartCard>
  );
}
