import Papa from "papaparse";
import type { Application, Prisma } from "@prisma/client";

export type ImportRow = Partial<Record<keyof Application | "tags", string>>;

const IMPORTABLE_COLUMNS = [
  "applicationType",
  "companyName",
  "roleTitle",
  "institutionName",
  "programName",
  "degreeLevel",
  "department",
  "facultyOrDepartment",
  "location",
  "country",
  "campus",
  "workMode",
  "status",
  "priority",
  "source",
  "applicationUrl",
  "jobPostingUrl",
  "programUrl",
  "applicationPortalUrl",
  "deadline",
  "appliedDate",
  "submittedDate",
  "season",
  "applicationYear",
  "intakeTerm",
  "intakeYear",
  "applicationRound",
  "compensation",
  "tuitionEstimate",
  "visaSponsorship",
  "referralUsed",
  "scholarshipApplied",
  "fundingStatus",
  "jobDescription",
  "statementPrompt",
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

function rowNumber(index: number) {
  return index + 2;
}

function isValidOptionalUrl(value: string | undefined) {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function validateApplicationsCsvRows(rows: ImportRow[], columns: string[]) {
  const requiredColumns = ["companyName", "roleTitle"];
  const missingColumns = requiredColumns.filter((column) => !columns.includes(column));
  const rowErrors = rows.flatMap((row, index) => {
    const errors = [];
    if (!row.companyName?.trim()) errors.push(`Row ${rowNumber(index)}: Company name is required.`);
    if (!row.roleTitle?.trim()) errors.push(`Row ${rowNumber(index)}: Role title is required.`);
    if (!isValidOptionalUrl(row.applicationUrl)) errors.push(`Row ${rowNumber(index)}: Application URL is not a valid URL.`);
    if (!isValidOptionalUrl(row.jobPostingUrl)) errors.push(`Row ${rowNumber(index)}: Job posting URL is not a valid URL.`);
    return errors;
  });

  return { missingColumns, rowErrors };
}

export function toApplicationsCsv(
  applications: Array<
    Application & {
      tags: { tag: { name: string } }[];
      jobDetail?: { companyName: string; roleTitle: string } | null;
      universityDetail?: {
        institutionName: string;
        programName: string;
        degreeLevel: string | null;
        facultyOrDepartment: string | null;
        campus: string | null;
        programUrl: string | null;
        applicationPortalUrl: string | null;
        intakeTerm: string | null;
        intakeYear: number | null;
        applicationRound: string | null;
        tuitionEstimate: string | null;
        scholarshipApplied: boolean;
        fundingStatus: string | null;
        statementPrompt: string | null;
      } | null;
    }
  >,
) {
  const rows = applications.map((app) => ({
    ...app,
    companyName: app.jobDetail?.companyName ?? app.companyName,
    roleTitle: app.jobDetail?.roleTitle ?? app.roleTitle,
    institutionName: app.universityDetail?.institutionName ?? "",
    programName: app.universityDetail?.programName ?? "",
    degreeLevel: app.universityDetail?.degreeLevel ?? "",
    facultyOrDepartment: app.universityDetail?.facultyOrDepartment ?? "",
    campus: app.universityDetail?.campus ?? "",
    programUrl: app.universityDetail?.programUrl ?? "",
    applicationPortalUrl: app.universityDetail?.applicationPortalUrl ?? "",
    submittedDate: app.applicationType === "UNIVERSITY" ? app.appliedDate : "",
    intakeTerm: app.universityDetail?.intakeTerm ?? "",
    intakeYear: app.universityDetail?.intakeYear ?? "",
    applicationRound: app.universityDetail?.applicationRound ?? "",
    tuitionEstimate: app.universityDetail?.tuitionEstimate ?? "",
    scholarshipApplied: app.universityDetail?.scholarshipApplied ?? "",
    fundingStatus: app.universityDetail?.fundingStatus ?? "",
    statementPrompt: app.universityDetail?.statementPrompt ?? "",
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
