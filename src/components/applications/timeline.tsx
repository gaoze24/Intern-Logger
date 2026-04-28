import { formatDate } from "@/lib/utils/date";

type TimelineItem = {
  id: string;
  title: string;
  description: string | null;
  occurredAt: Date;
  type: string;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-md border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{item.title}</p>
            <span className="text-xs text-muted-foreground">{formatDate(item.occurredAt)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{item.type.replaceAll("_", " ")}</p>
          {item.description ? <p className="mt-1 text-sm">{item.description}</p> : null}
        </div>
      ))}
    </div>
  );
}
