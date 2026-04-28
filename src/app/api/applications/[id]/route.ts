import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  archiveApplication,
  deleteApplication,
  getApplicationById,
  updateApplication,
} from "@/lib/services/applications";
import { apiError, parseJsonBody } from "@/lib/http";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await getApplicationById(session.user.id, id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const payload = await parseJsonBody(request);
    if ((payload as { archive?: boolean }).archive) {
      const data = await archiveApplication(session.user.id, id);
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
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const data = await deleteApplication(session.user.id, id);
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}
