import type { Priority } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS } from "@/constants/app";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={PRIORITY_COLORS[priority]}>{priority}</Badge>;
}
