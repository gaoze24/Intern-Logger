import type { Priority } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/constants/app";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={PRIORITY_COLORS[priority]}>{PRIORITY_LABELS[priority]}</Badge>;
}
