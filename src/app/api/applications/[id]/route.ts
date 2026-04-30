import { NextResponse } from "next/server";
import {
  archiveApplication,
  deleteApplication,
  getApplicationById,
  restoreApplication,
  updateApplication,
} from "@/lib/services/applications";
import { apiError, parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { getVerifiedSessionUserId } from "@/lib/auth-helpers";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) return unauthorizedResponse();
  const { id } = await params;
  const data = await getApplicationById(userId, id);
  if (!data) {
    return NextResponse.json(
      { ok: false, code: "NOT_FOUND", message: "This application no longer exists." },
      { status: 404 },
    );
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) return unauthorizedResponse();
  try {
    const { id } = await params;
    const payload = await parseJsonBody(request);
    if ((payload as { archive?: boolean }).archive) {
      const data = await archiveApplication(userId, id);
      return NextResponse.json({ data });
    }
    if ((payload as { restore?: boolean }).restore) {
      const data = await restoreApplication(userId, id);
      return NextResponse.json({ data });
    }
    const data = await updateApplication(userId, id, payload);
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) return unauthorizedResponse();
  try {
    const { id } = await params;
    const data = await deleteApplication(userId, id);
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}
