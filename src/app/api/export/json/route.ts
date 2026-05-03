import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { exportJson } from "@/lib/services/applications";
import { getCurrentApplicationMode } from "@/lib/services/settings";
import { unauthorizedResponse } from "@/lib/http";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorizedResponse();
  }
  const mode = await getCurrentApplicationMode(session.user.id);
  const data = await exportJson(session.user.id, mode);
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${mode === "UNIVERSITY" ? "university-applications" : "job-applications"}.json"`,
    },
  });
}
