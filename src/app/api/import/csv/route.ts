import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ApplicationType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { parseApplicationsCsv } from "@/lib/csv/applications";
import { db } from "@/lib/db";
import { detectDuplicates } from "@/lib/utils/duplicate";
import { unauthorizedResponse } from "@/lib/http";

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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorizedResponse();
  }
  const body = (await req.json().catch(() => null)) as { csv?: string } | null;
  if (!body?.csv?.trim()) {
    return NextResponse.json(
      { ok: false, code: "CSV_VALIDATION_ERROR", message: "Choose a CSV file to import." },
      { status: 400 },
    );
  }
  const parsed = parseApplicationsCsv(body.csv);
  if (parsed.errors.length) {
    return NextResponse.json(
      {
        ok: false,
        code: "CSV_PARSE_ERROR",
        message: "Could not read this CSV file. Check the formatting and try again.",
      },
      { status: 400 },
    );
  }

  const requiredColumns = ["companyName", "roleTitle"];
  const missingColumns = requiredColumns.filter((column) => !parsed.columns.includes(column));
  if (missingColumns.length) {
    return NextResponse.json(
      {
        ok: false,
        code: "CSV_VALIDATION_ERROR",
        message: `The CSV is missing required columns: ${missingColumns.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const existing = await db.application.findMany({ where: { userId: session.user.id } });
  const report = [];
  let imported = 0;
  for (const [index, row] of parsed.rows.entries()) {
    const applicationType = (row.applicationType?.trim().toUpperCase() || "JOB") as ApplicationType;
    if (applicationType === ApplicationType.UNIVERSITY) {
      report.push({
        row: rowNumber(index),
        status: "skipped",
        reason: "University CSV import is not available yet.",
      });
      continue;
    }
    const companyName = row.companyName?.trim() ?? "";
    const roleTitle = row.roleTitle?.trim() ?? "";
    const errors = [];
    if (!companyName) errors.push(`Row ${rowNumber(index)}: Company name is required.`);
    if (!roleTitle) errors.push(`Row ${rowNumber(index)}: Role title is required.`);
    if (!isValidOptionalUrl(row.applicationUrl)) errors.push(`Row ${rowNumber(index)}: Application URL is not a valid URL.`);
    if (!isValidOptionalUrl(row.jobPostingUrl)) errors.push(`Row ${rowNumber(index)}: Job posting URL is not a valid URL.`);
    if (errors.length) {
      report.push({ row: rowNumber(index), status: "skipped", reason: errors.join(" ") });
      continue;
    }
    const dupes = detectDuplicates(existing, {
      companyName,
      roleTitle,
      season: null,
      jobPostingUrl: row.jobPostingUrl ?? null,
      applicationUrl: row.applicationUrl ?? null,
    });
    if (dupes.length) {
      report.push({
        row: rowNumber(index),
        status: "skipped",
        reason: `Row ${rowNumber(index)}: You already have an application for this company and role.`,
      });
      continue;
    }
    await db.application.create({
      data: {
        userId: session.user.id,
        applicationType: ApplicationType.JOB,
        companyName,
        roleTitle,
        department: row.department ?? null,
        location: row.location ?? null,
        country: row.country ?? null,
        notes: row.notes ?? null,
        jobDescription: row.jobDescription ?? null,
        jobDetail: {
          create: {
            companyName,
            roleTitle,
            department: row.department ?? null,
            jobPostingUrl: row.jobPostingUrl ?? null,
            applicationUrl: row.applicationUrl ?? null,
            jobDescription: row.jobDescription ?? null,
          },
        },
      },
    });
    imported += 1;
    report.push({ row: rowNumber(index), status: "imported" });
  }

  const skipped = report.length - imported;
  return NextResponse.json({
    ok: true,
    data: {
      imported,
      skipped,
      report,
      columns: parsed.columns,
    },
    message: skipped
      ? `Imported ${imported} applications. Skipped ${skipped} rows with errors.`
      : `Imported ${imported} applications.`,
  });
}
