import { NextResponse } from "next/server";
import { ApplicationStatusType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { changeApplicationStatus } from "@/lib/services/applications";
import { apiError, parseJsonBody } from "@/lib/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const payload = await parseJsonBody<{ status: ApplicationStatusType; note?: string }>(request);
    const data = await changeApplicationStatus(session.user.id, id, payload.status, payload.note);
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}
