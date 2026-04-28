import Papa from "papaparse";
import type { Application, Prisma } from "@prisma/client";

export type ImportRow = Partial<Record<keyof Application | "tags", string>>;

const IMPORTABLE_COLUMNS = [
  "companyName",
  "roleTitle",
  "department",
  "location",
  "country",
  "workMode",
  "status",
  "priority",
  "source",
  "applicationUrl",
  "jobPostingUrl",
  "deadline",
  "appliedDate",
  "season",
  "applicationYear",
  "compensation",
  "visaSponsorship",
  "referralUsed",
  "jobDescription",
  "notes",
  "tags",
] as const;

export function parseApplicationsCsv(content: string) {
  const parsed = Papa.parse<ImportRow>(content, { header: true, skipEmptyLines: true });
  return {
    rows: parsed.data,
    errors: parsed.errors,
    columns: parsed.meta.fields ?? [],
  };
}

export function toApplicationsCsv(
  applications: Array<
    Application & {
      tags: { tag: { name: string } }[];
    }
  >,
) {
  const rows = applications.map((app) => ({
    ...app,
    tags: app.tags.map((t) => t.tag.name).join("|"),
  }));
  return Papa.unparse(rows, { columns: [...IMPORTABLE_COLUMNS] });
}

export function mapCsvRowToApplicationCreateInput(
  row: ImportRow,
  userId: string,
): Prisma.ApplicationCreateInput {
  return {
    user: { connect: { id: userId } },
    companyName: row.companyName ?? "",
    roleTitle: row.roleTitle ?? "",
    department: row.department ?? null,
    location: row.location ?? null,
    country: row.country ?? null,
    applicationUrl: row.applicationUrl ?? null,
    jobPostingUrl: row.jobPostingUrl ?? null,
    jobDescription: row.jobDescription ?? null,
    notes: row.notes ?? null,
    compensation: row.compensation ?? null,
  };
}
