import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { ApplicationWithRelations } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/applications/status-badge";
import { PriorityBadge } from "@/components/applications/priority-badge";
import { DeadlineBadge } from "@/components/applications/deadline-badge";
import { suggestNextAction } from "@/lib/utils/next-action";

export function ApplicationCard({ application }: { application: ApplicationWithRelations }) {
  return (
    <Link href={`/applications/${application.id}`}>
      <Card className="hover:border-primary/50 hover:shadow-sm transition-all">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">{application.companyName}</CardTitle>
              <CardDescription>{application.roleTitle}</CardDescription>
            </div>
            <PriorityBadge priority={application.priority} />
          </div>
          <StatusBadge status={application.status} />
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" />
            <DeadlineBadge deadline={application.deadline} />
          </div>
          <p className="text-xs text-muted-foreground">{suggestNextAction(application)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
