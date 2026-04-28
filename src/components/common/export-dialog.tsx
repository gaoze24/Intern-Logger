"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ExportDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">
          <Download className="mr-1 size-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export data</DialogTitle>
          <DialogDescription>Download your data in JSON or CSV format.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <form action="/api/export/json" method="get">
            <Button type="submit" variant="outline">JSON</Button>
          </form>
          <form action="/api/export/csv" method="get">
            <Button type="submit" variant="outline">CSV</Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
