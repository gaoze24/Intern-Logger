import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ApplicationStatusType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import {
  createApplication,
  getApplicationsList,
  normalizeApplicationSort,
  normalizeApplicationTab,
} from "@/lib/services/applications";
import { apiError, parseJsonBody, unauthorizedResponse } from "@/lib/http";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const rawStatus = searchParams.get("status") ?? undefined;
  const status =
    rawStatus && Object.values(ApplicationStatusType).includes(rawStatus as ApplicationStatusType)
      ? (rawStatus as ApplicationStatusType)
      : undefined;
  const includeArchived = searchParams.get("includeArchived") === "true";
  const tab = includeArchived ? "all" : normalizeApplicationTab(searchParams.get("tab") ?? undefined);
  const { sort, order } = normalizeApplicationSort(searchParams.get("sort") ?? undefined, searchParams.get("order") ?? undefined);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "25");
  const apps = await getApplicationsList(session.user.id, {
    search,
    tab,
    statuses: status ? [status] : undefined,
    sort,
    order,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: [25, 50, 100].includes(pageSize) ? pageSize : 25,
  });

  return NextResponse.json({ data: apps });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorizedResponse();
  try {
    const payload = await parseJsonBody(request);
    const result = await createApplication(session.user.id, payload);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
