import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

export function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {ITEMS.map((item) => (
        <Card key={item.key}>
          <CardHeader className="pb-2">
            <CardDescription>{item.title}</CardDescription>
            <CardTitle className="text-2xl">{stats[item.key]}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">{item.description}</CardContent>
        </Card>
      ))}
    </div>
  );
}
