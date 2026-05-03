import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createDocument, getDocuments } from "@/lib/services/entities";
import { getCurrentApplicationMode } from "@/lib/services/settings";
import { apiError, parseJsonBody, unauthorizedResponse } from "@/lib/http";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorizedResponse();
  const mode = await getCurrentApplicationMode(session.user.id);
  const data = await getDocuments(session.user.id, { applicationType: mode });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorizedResponse();
  try {
    const mode = await getCurrentApplicationMode(session.user.id);
    const payload = await parseJsonBody(request);
    const data = await createDocument(session.user.id, { applicationType: mode, ...(payload as Record<string, unknown>) });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
