import Link from "next/link";
import type { ApplicationWithRelations } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/applications/status-badge";
import { PriorityBadge } from "@/components/applications/priority-badge";
import { DeadlineBadge } from "@/components/applications/deadline-badge";
import { formatDate } from "@/lib/utils/date";
import { suggestNextAction } from "@/lib/utils/next-action";

export function ApplicationTable({ applications }: { applications: ApplicationWithRelations[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
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
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <Link href={`/applications/${app.id}`} className="font-medium hover:underline">
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
              <TableCell className="max-w-[260px] truncate text-muted-foreground">{suggestNextAction(app)}</TableCell>
              <TableCell>{formatDate(app.updatedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
