import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  archiveApplication,
  deleteApplication,
  getApplicationById,
  restoreApplication,
  updateApplication,
} from "@/lib/services/applications";
import { apiError, parseJsonBody, unauthorizedResponse } from "@/lib/http";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorizedResponse();
  const { id } = await params;
  const data = await getApplicationById(session.user.id, id);
  if (!data) {
    return NextResponse.json(
      { ok: false, code: "NOT_FOUND", message: "This application no longer exists." },
      { status: 404 },
    );
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorizedResponse();
  try {
    const { id } = await params;
    const payload = await parseJsonBody(request);
    if ((payload as { archive?: boolean }).archive) {
      const data = await archiveApplication(session.user.id, id);
      return NextResponse.json({ data });
    }
    if ((payload as { restore?: boolean }).restore) {
      const data = await restoreApplication(session.user.id, id);
      return NextResponse.json({ data });
    }
    const data = await updateApplication(session.user.id, id, payload);
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorizedResponse();
  try {
    const { id } = await params;
    const data = await deleteApplication(session.user.id, id);
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}
