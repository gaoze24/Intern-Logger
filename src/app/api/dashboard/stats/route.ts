import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/dashboard";
import { unauthorizedResponse } from "@/lib/http";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorizedResponse();
  const data = await getDashboardStats(session.user.id);
  return NextResponse.json({ data });
}
