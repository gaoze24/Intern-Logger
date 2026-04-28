import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getApplications } from "@/lib/services/applications";
import { toApplicationsCsv } from "@/lib/csv/applications";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const apps = await getApplications(session.user.id, { includeArchived: true });
  const csv = toApplicationsCsv(apps);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="applications.csv"',
    },
  });
}
