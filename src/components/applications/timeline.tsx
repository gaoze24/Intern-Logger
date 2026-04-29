import { formatDate } from "@/lib/utils/date";
import { formatEnumLabel } from "@/constants/app";

type TimelineItem = {
  id: string;
  title: string;
  description: string | null;
  occurredAt: Date;
  type: string;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[15px] font-medium">{item.title}</p>
            <span className="text-sm text-muted-foreground">{formatDate(item.occurredAt)}</span>
          </div>
          <p className="text-sm text-muted-foreground">{formatEnumLabel(item.type)}</p>
          {item.description ? <p className="mt-1 text-[15px]">{item.description}</p> : null}
        </div>
      ))}
    </div>
  );
}
