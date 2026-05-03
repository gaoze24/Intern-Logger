import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getModeLabels, type ApplicationMode } from "@/constants/app";

type Stats = {
  totalApplications: number;
  activeApplications: number;
  interviewsUpcoming: number;
  offers: number;
  rejections: number;
  deadlinesThisWeek: number;
  followUpsDue: number;
};

const ITEMS: { key: keyof Stats; title: string; description: string }[] = [
  { key: "totalApplications", title: "Total applications", description: "All tracked applications" },
  { key: "activeApplications", title: "Active", description: "Not final-state applications" },
  { key: "interviewsUpcoming", title: "Upcoming interviews", description: "Scheduled next events" },
  { key: "offers", title: "Offers", description: "Offer-stage applications" },
  { key: "rejections", title: "Rejections", description: "Rejected applications" },
  { key: "deadlinesThisWeek", title: "Deadlines this week", description: "Due in the next 7 days" },
  { key: "followUpsDue", title: "Follow-ups due", description: "Reminder-driven follow-ups" },
];

export function StatsGrid({ stats, mode = "JOB" }: { stats: Stats; mode?: ApplicationMode }) {
  const labels = getModeLabels(mode);
  const items = ITEMS.map((item) => {
    if (item.key === "offers") {
      return {
        ...item,
        title: labels.acceptedMetric,
        description: mode === "UNIVERSITY" ? "Accepted applications" : item.description,
      };
    }
    if (item.key === "rejections") {
      return { ...item, title: labels.rejectedMetric };
    }
    return item;
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.key} className="shadow-sm">
          <CardHeader className="space-y-3 p-6 pb-2">
            <CardDescription className="text-sm font-medium">{item.title}</CardDescription>
            <CardTitle className="text-4xl font-semibold tracking-tight">{stats[item.key]}</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 text-sm text-muted-foreground">{item.description}</CardContent>
        </Card>
      ))}
    </div>
  );
}
