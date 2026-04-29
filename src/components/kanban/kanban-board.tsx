"use client";

import type { DragEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import { CalendarDays, MapPin, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApplicationStatusType, type Priority } from "@prisma/client";
import type { KanbanApplicationItem } from "@/lib/services/applications";
import { changeApplicationStatusAction } from "@/actions/applications";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABELS, PRIORITY_OPTIONS } from "@/constants/app";
import { PriorityBadge } from "@/components/applications/priority-badge";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

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

const CLOSED_STAGES: ApplicationStatusType[] = ["REJECTED", "WITHDRAWN", "ARCHIVED"];

type KanbanColumnProps = {
  status: ApplicationStatusType;
  applications: KanbanApplicationItem[];
  allApplications: KanbanApplicationItem[];
  pending: boolean;
  draggingId: string | null;
  onMove: (id: string, status: ApplicationStatusType) => void;
  onDragStart: (id: string, event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
};

function canDrop(target: ApplicationStatusType, application?: KanbanApplicationItem) {
  return Boolean(application && application.status !== target);
}

function EmptyKanbanColumn() {
  return (
    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-background/70 px-4 text-center">
      <p className="text-sm text-muted-foreground">No applications</p>
    </div>
  );
}

function KanbanCard({
  application,
  pending,
  draggingId,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  application: KanbanApplicationItem;
  pending: boolean;
  draggingId: string | null;
  onMove: (id: string, status: ApplicationStatusType) => void;
  onDragStart: (id: string, event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}) {
  return (
    <article
      draggable={!pending}
      onDragStart={(event) => onDragStart(application.id, event)}
      onDragEnd={onDragEnd}
      className={cn(
        "rounded-lg border bg-background p-3 text-sm shadow-sm transition hover:border-foreground/20",
        draggingId === application.id && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate font-semibold text-foreground">{application.companyName}</h4>
          <p className="truncate text-xs text-muted-foreground">{application.roleTitle}</p>
        </div>
        <PriorityBadge priority={application.priority} />
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
        <div className="flex min-w-0 items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{application.location || "No location"}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <CalendarDays className="size-3.5 shrink-0" />
          <span className="truncate">{application.deadline ? formatDate(application.deadline) : "No deadline"}</span>
        </div>
      </div>

      <div className="mt-3">
        <label className="sr-only" htmlFor={`move-${application.id}`}>
          Move {application.companyName}
        </label>
        <select
          id={`move-${application.id}`}
          value={application.status}
          disabled={pending}
          onChange={(event) => onMove(application.id, event.target.value as ApplicationStatusType)}
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
        >
          {COLUMNS.map((target) => (
            <option key={target} value={target}>
              Move to {STATUS_LABELS[target]}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}

function KanbanColumn({
  status,
  applications,
  allApplications,
  pending,
  draggingId,
  onMove,
  onDragStart,
  onDragEnd,
}: KanbanColumnProps) {
  return (
    <section
      onDragOver={(event) => {
        if (draggingId) event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        const draggedId = event.dataTransfer.getData("text/plain") || draggingId;
        const draggedApplication = allApplications.find((application) => application.id === draggedId);
        if (draggedId && canDrop(status, draggedApplication)) onMove(draggedId, status);
      }}
      className="flex max-h-[calc(100vh-190px)] min-h-[360px] w-[85vw] max-w-[320px] shrink-0 flex-col overflow-hidden rounded-xl border bg-muted/40 shadow-sm sm:w-[300px]"
    >
      <div className="flex items-center justify-between gap-3 border-b bg-background/75 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{STATUS_LABELS[status]}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border bg-background px-2 text-xs font-medium text-muted-foreground">
            {applications.length}
          </span>
          <Link
            href={`/applications/new?status=${status}`}
            aria-label={`Add application to ${STATUS_LABELS[status]}`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <Plus className="size-4" />
          </Link>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {applications.length ? (
          applications.map((application) => (
            <KanbanCard
              key={application.id}
              application={application}
              pending={pending}
              draggingId={draggingId}
              onMove={onMove}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        ) : (
          <EmptyKanbanColumn />
        )}
      </div>
    </section>
  );
}

export function KanbanBoard({ applications }: { applications: KanbanApplicationItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [showClosedStages, setShowClosedStages] = useState(false);

  const visibleColumns = useMemo(
    () => (showClosedStages ? COLUMNS : COLUMNS.filter((column) => !CLOSED_STAGES.includes(column))),
    [showClosedStages]
  );

  const filteredApplications = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesSearch =
        !term ||
        application.companyName.toLowerCase().includes(term) ||
        application.roleTitle.toLowerCase().includes(term) ||
        Boolean(application.location?.toLowerCase().includes(term));
      const matchesPriority = priority === "ALL" || application.priority === priority;
      return matchesSearch && matchesPriority;
    });
  }, [applications, priority, search]);

  const applicationsByStatus = useMemo(() => {
    return visibleColumns.reduce(
      (groups, status) => {
        groups[status] = filteredApplications.filter((application) => application.status === status);
        return groups;
      },
      {} as Partial<Record<ApplicationStatusType, KanbanApplicationItem[]>>
    );
  }, [filteredApplications, visibleColumns]);

  const move = (id: string, status: ApplicationStatusType) => {
    const application = applications.find((item) => item.id === id);
    if (!application || application.status === status) return;
    if (CLOSED_STAGES.includes(status)) {
      const yes = window.confirm(`Move application to ${STATUS_LABELS[status]}?`);
      if (!yes) return;
    }
    const note = window.prompt("Optional note for status change:");
    startTransition(async () => {
      const result = await changeApplicationStatusAction(id, status, note ?? undefined);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message ?? "Status updated");
      router.refresh();
    });
  };

  const handleDragStart = (id: string, event: DragEvent<HTMLElement>) => {
    setDraggingId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search applications"
            className="h-9 pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="kanban-priority">
            Filter by priority
          </label>
          <select
            id="kanban-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority | "ALL")}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="ALL">All priorities</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={showClosedStages}
              onChange={(event) => setShowClosedStages(event.target.checked)}
              className="size-4 rounded border-input"
            />
            Show closed stages
          </label>
          <Link href="/applications/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="size-4" />
            Add Application
          </Link>
        </div>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 pb-4 md:-mx-8 md:px-8">
        <div className="flex w-max gap-4">
          {visibleColumns.map((column) => (
            <KanbanColumn
              key={column}
              status={column}
              applications={applicationsByStatus[column] ?? []}
              allApplications={applications}
              pending={pending}
              draggingId={draggingId}
              onMove={move}
              onDragStart={handleDragStart}
              onDragEnd={() => setDraggingId(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
