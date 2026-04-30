"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Edit, Eye, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ApplicationListItem } from "@/lib/services/applications";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/applications/status-badge";
import { PriorityBadge } from "@/components/applications/priority-badge";
import { DeadlineBadge } from "@/components/applications/deadline-badge";
import { formatDate } from "@/lib/utils/date";
import { suggestNextAction } from "@/lib/utils/next-action";
import {
  archiveApplicationAction,
  deleteApplicationAction,
  restoreApplicationAction,
} from "@/actions/applications";
import { cn } from "@/lib/utils";

type ApplicationTableProps = {
  applications: ApplicationListItem[];
  showArchivedAt?: boolean;
};

type ConfirmAction = {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  run: () => Promise<{ ok: boolean; message?: string }>;
};

export function ApplicationTable({ applications, showArchivedAt }: ApplicationTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Next Action</TableHead>
            {showArchivedAt ? <TableHead>Archived At</TableHead> : null}
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow
              key={app.id}
              className={cn(
                "cursor-pointer hover:bg-muted/50",
                (app.archived || app.status === "ARCHIVED") && "text-muted-foreground",
              )}
              onClick={() => router.push(`/applications/${app.id}`)}
            >
              <TableCell>
                <Link
                  href={`/applications/${app.id}`}
                  className="font-medium text-foreground hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  {app.companyName}
                </Link>
              </TableCell>
              <TableCell>{app.roleTitle}</TableCell>
              <TableCell>{app.location ?? "—"}</TableCell>
              <TableCell>
                <StatusBadge status={app.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={app.priority} />
              </TableCell>
              <TableCell>
                <DeadlineBadge deadline={app.deadline} />
              </TableCell>
              <TableCell>{formatDate(app.appliedDate)}</TableCell>
              <TableCell className="max-w-[260px] truncate text-muted-foreground">
                {suggestNextAction({ status: app.status, updatedAt: app.updatedAt, deadline: app.deadline })}
              </TableCell>
              {showArchivedAt ? <TableCell>{formatDate(app.archivedAt)}</TableCell> : null}
              <TableCell>{formatDate(app.updatedAt)}</TableCell>
              <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                <ApplicationRowActions application={app} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ApplicationRowActions({ application }: { application: ApplicationListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const isArchived = application.archived || application.status === "ARCHIVED";

  const runAction = () => {
    if (!confirmAction) return;
    startTransition(async () => {
      const result = await confirmAction.run();
      if (!result.ok) {
        toast.error(result.message ?? "Could not update this application. Please try again.");
        return;
      }
      toast.success(result.message ?? "Application updated.");
      setConfirmAction(null);
      router.refresh();
    });
  };

  const archiveConfirm: ConfirmAction = {
    title: "Archive this application?",
    description: "It will be hidden from the active applications list but can be restored later.",
    confirmLabel: "Archive",
    run: () => archiveApplicationAction(application.id),
  };

  const restoreConfirm: ConfirmAction = {
    title: "Restore this application?",
    description: "It will return to the active applications list and continue using its previous workflow status.",
    confirmLabel: "Restore",
    run: () => restoreApplicationAction(application.id),
  };

  const deleteConfirm: ConfirmAction = {
    title: "Delete application?",
    description: "This will permanently remove this application from your tracker. This action cannot be undone.",
    confirmLabel: "Delete",
    destructive: true,
    run: () => deleteApplicationAction(application.id),
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions for ${application.companyName}`}
              variant="ghost"
              size="iconSm"
              disabled={isPending}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={() => router.push(`/applications/${application.id}`)}>
            <Eye className="size-4" />
            View
          </DropdownMenuItem>
          {!isArchived ? (
            <DropdownMenuItem onClick={() => router.push(`/applications/${application.id}?tab=edit`)}>
              <Edit className="size-4" />
              Edit
            </DropdownMenuItem>
          ) : null}
          {!isArchived ? (
            <DropdownMenuItem onClick={() => setConfirmAction(archiveConfirm)}>
              <Archive className="size-4" />
              Archive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setConfirmAction(restoreConfirm)}>
              <RotateCcw className="size-4" />
              Restore
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmAction(deleteConfirm)}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={Boolean(confirmAction)} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              className={confirmAction?.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={runAction}
            >
              {isPending ? "Working..." : confirmAction?.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
