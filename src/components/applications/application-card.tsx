import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { ApplicationListItem } from "@/lib/services/applications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/applications/status-badge";
import { PriorityBadge } from "@/components/applications/priority-badge";
import { DeadlineBadge } from "@/components/applications/deadline-badge";
import { suggestNextAction } from "@/lib/utils/next-action";
import { getApplicationPrimaryTitle, getApplicationSecondaryTitle } from "@/constants/app";

export function ApplicationCard({ application }: { application: ApplicationListItem }) {
  return (
    <Link href={`/applications/${application.id}`}>
      <Card className="transition-all hover:border-primary/50 hover:shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>{getApplicationPrimaryTitle(application)}</CardTitle>
              <CardDescription className="text-[15px]">{getApplicationSecondaryTitle(application)}</CardDescription>
            </div>
            <PriorityBadge priority={application.priority} />
          </div>
          <StatusBadge status={application.status} />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" />
            <DeadlineBadge deadline={application.deadline} />
          </div>
          <p className="text-sm text-muted-foreground">{suggestNextAction({ status: application.status, updatedAt: application.updatedAt, deadline: application.deadline })}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
