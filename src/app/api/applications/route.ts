import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createApplication, getApplications } from "@/lib/services/applications";
import { apiError, parseJsonBody } from "@/lib/http";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const includeArchived = searchParams.get("includeArchived") === "true";
  const apps = await getApplications(session.user.id, {
    search,
    includeArchived,
    statuses: status ? [status as never] : undefined,
  });

  return NextResponse.json({ data: apps });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const payload = await parseJsonBody(request);
    const result = await createApplication(session.user.id, payload);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
