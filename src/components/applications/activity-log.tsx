import { formatDate } from "@/lib/utils/date";
import { formatEnumLabel } from "@/constants/app";

type ActivityItem = {
  id: string;
  action: string;
  entityType: string;
  createdAt: Date;
};

export function ActivityLog({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border p-4 text-[15px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{formatEnumLabel(item.action)}</span>
            <span className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</span>
          </div>
          <span className="text-sm text-muted-foreground">{formatEnumLabel(item.entityType)}</span>
        </div>
      ))}
    </div>
  );
}
