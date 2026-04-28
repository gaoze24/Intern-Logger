import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseApplicationsCsv } from "@/lib/csv/applications";
import { db } from "@/lib/db";
import { detectDuplicates } from "@/lib/utils/duplicate";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as { csv: string };
  const parsed = parseApplicationsCsv(body.csv);
  if (parsed.errors.length) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  const existing = await db.application.findMany({ where: { userId: session.user.id } });
  const report = [];
  let imported = 0;
  for (const row of parsed.rows) {
    if (!row.companyName || !row.roleTitle) {
      report.push({ row, status: "skipped", reason: "Missing companyName or roleTitle" });
      continue;
    }
    const dupes = detectDuplicates(existing, {
      companyName: row.companyName,
      roleTitle: row.roleTitle,
      season: null,
      jobPostingUrl: row.jobPostingUrl ?? null,
      applicationUrl: row.applicationUrl ?? null,
    });
    if (dupes.length) {
      report.push({ row, status: "skipped", reason: "Duplicate detected", duplicates: dupes });
      continue;
    }
    await db.application.create({
      data: {
        userId: session.user.id,
        companyName: row.companyName,
        roleTitle: row.roleTitle,
        department: row.department ?? null,
        location: row.location ?? null,
        country: row.country ?? null,
        notes: row.notes ?? null,
        jobDescription: row.jobDescription ?? null,
      },
    });
    imported += 1;
    report.push({ row, status: "imported" });
  }

  return NextResponse.json({
    imported,
    skipped: report.length - imported,
    report,
    columns: parsed.columns,
  });
}
