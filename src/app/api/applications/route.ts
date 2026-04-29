import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createApplication, getApplicationsList } from "@/lib/services/applications";
import { apiError, parseJsonBody } from "@/lib/http";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const includeArchived = searchParams.get("includeArchived") === "true";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "25");
  const apps = await getApplicationsList(session.user.id, {
    search,
    includeArchived,
    statuses: status ? [status as never] : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: [25, 50, 100].includes(pageSize) ? pageSize : 25,
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
