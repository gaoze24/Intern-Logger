import { NextResponse } from "next/server";
import { ApplicationStatusType } from "@prisma/client";
import {
  createApplication,
  getApplicationsList,
  normalizeApplicationSort,
  normalizeApplicationTab,
} from "@/lib/services/applications";
import { apiError, parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { getVerifiedSessionUserId } from "@/lib/auth-helpers";
import { getCurrentApplicationMode } from "@/lib/services/settings";
import { isStatusAllowedForMode } from "@/constants/app";

export async function GET(request: Request) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const mode = await getCurrentApplicationMode(userId);
  const search = searchParams.get("search") ?? undefined;
  const rawStatus = searchParams.get("status") ?? undefined;
  const status =
    rawStatus &&
    Object.values(ApplicationStatusType).includes(rawStatus as ApplicationStatusType) &&
    isStatusAllowedForMode(rawStatus as ApplicationStatusType, mode)
      ? (rawStatus as ApplicationStatusType)
      : undefined;
  const includeArchived = searchParams.get("includeArchived") === "true";
  const tab = includeArchived ? "all" : normalizeApplicationTab(searchParams.get("tab") ?? undefined);
  const { sort, order } = normalizeApplicationSort(searchParams.get("sort") ?? undefined, searchParams.get("order") ?? undefined);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "25");
  const apps = await getApplicationsList(userId, {
    applicationType: mode,
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
  const userId = await getVerifiedSessionUserId();
  if (!userId) return unauthorizedResponse();
  try {
    const mode = await getCurrentApplicationMode(userId);
    const payload = await parseJsonBody(request);
    const result = await createApplication(userId, { applicationType: mode, ...(payload as Record<string, unknown>) });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
