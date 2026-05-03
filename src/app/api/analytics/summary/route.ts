import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnalyticsSummary } from "@/lib/services/dashboard";
import { getCurrentApplicationMode } from "@/lib/services/settings";
import { unauthorizedResponse } from "@/lib/http";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorizedResponse();
  const mode = await getCurrentApplicationMode(session.user.id);
  const data = await getAnalyticsSummary(session.user.id, mode);
  return NextResponse.json({ data });
}
