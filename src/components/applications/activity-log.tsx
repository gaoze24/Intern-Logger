import { formatDate } from "@/lib/utils/date";

type ActivityItem = {
  id: string;
  action: string;
  entityType: string;
  createdAt: Date;
};

export function ActivityLog({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-md border p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{item.action.replaceAll("_", " ")}</span>
            <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
          </div>
          <span className="text-xs text-muted-foreground">{item.entityType.toLowerCase()}</span>
        </div>
      ))}
    </div>
  );
}
