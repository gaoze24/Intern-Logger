"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function ImportCsvDialog() {
  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const parsePreview = async () => {
    const Papa = (await import("papaparse")).default;
    const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
    if (parsed.errors.length) {
      toast.error("Could not read this CSV file. Check the formatting and try again.");
      return;
    }
    setImportErrors([]);
    setPreviewRows(parsed.data.slice(0, 5));
  };

  const importCsv = async () => {
    const response = await fetch("/api/import/csv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    if (!response.ok) {
      const error = await response.json();
      const message = error?.message || "Could not import this CSV file. Please try again.";
      setImportErrors([message]);
      toast.error(message);
      return;
    }
    const result = (await response.json()) as {
      ok: true;
      data: { imported: number; skipped: number; report: { status: string; reason?: string }[] };
      message: string;
    };
    const rowErrors = result.data.report.flatMap((row) => (row.status === "skipped" && row.reason ? [row.reason] : []));
    setImportErrors(rowErrors);
    toast.success(result.message);
    if (result.data.skipped === 0) {
      setOpen(false);
      setCsv("");
      setPreviewRows([]);
      setImportErrors([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline">Import CSV</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import applications from CSV</DialogTitle>
          <DialogDescription>Paste CSV content, preview, then import valid rows.</DialogDescription>
        </DialogHeader>
          <div className="space-y-4">
            <Textarea rows={10} value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="companyName,roleTitle,location,..." />
            {importErrors.length ? (
              <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {importErrors.slice(0, 5).map((error) => (
                  <p key={error}>{error}</p>
                ))}
                {importErrors.length > 5 ? <p>{importErrors.length - 5} more rows need attention.</p> : null}
              </div>
            ) : null}
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={parsePreview}>Preview</Button>
              <Button onClick={importCsv}>Import</Button>
            </div>
            {previewRows.length > 0 ? (
            <div className="rounded-md border p-3 text-sm">
              {previewRows.map((row, idx) => (
                <pre key={idx} className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(row, null, 2)}</pre>
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
