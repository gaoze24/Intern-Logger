"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ApplicationStatusType } from "@prisma/client";
import type { ApplicationWithRelations } from "@/types";
import { changeApplicationStatusAction } from "@/actions/applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS } from "@/constants/app";
import { PriorityBadge } from "@/components/applications/priority-badge";
import { DeadlineBadge } from "@/components/applications/deadline-badge";

const COLUMNS: ApplicationStatusType[] = [
  "WISHLIST",
  "PREPARING",
  "APPLIED",
  "ONLINE_ASSESSMENT",
  "RECRUITER_SCREEN",
  "TECHNICAL_INTERVIEW",
  "BEHAVIORAL_INTERVIEW",
  "FINAL_ROUND",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
  "ARCHIVED",
];

const FINAL_STATES: ApplicationStatusType[] = ["REJECTED", "WITHDRAWN", "ARCHIVED"];

export function KanbanBoard({ applications }: { applications: ApplicationWithRelations[] }) {
  const [pending, startTransition] = useTransition();

  const move = (id: string, status: ApplicationStatusType) => {
    if (FINAL_STATES.includes(status)) {
      const yes = window.confirm(`Move application to ${STATUS_LABELS[status]}?`);
      if (!yes) return;
    }
    const note = window.prompt("Optional note for status change:");
    startTransition(async () => {
      try {
        await changeApplicationStatusAction(id, status, note ?? undefined);
        toast.success("Status updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update status");
      }
    });
  };

  return (
    <div className="grid min-w-max grid-cols-12 gap-3 overflow-x-auto pb-2">
      {COLUMNS.map((column) => (
        <Card key={column} className="w-72">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{STATUS_LABELS[column]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {applications
              .filter((app) => app.status === column)
              .map((application) => (
                <Card key={application.id} className="border-dashed">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm">{application.companyName}</CardTitle>
                    <p className="text-xs text-muted-foreground">{application.roleTitle}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 pt-0">
                    <div className="flex items-center justify-between">
                      <PriorityBadge priority={application.priority} />
                      <DeadlineBadge deadline={application.deadline} />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {COLUMNS.filter((s) => s !== column).slice(0, 4).map((target) => (
                        <Button
                          key={target}
                          variant="outline"
                          size="xs"
                          disabled={pending}
                          onClick={() => move(application.id, target)}
                        >
                          {STATUS_LABELS[target]}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
