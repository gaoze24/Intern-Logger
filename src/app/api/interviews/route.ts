import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createInterview, getInterviews } from "@/lib/services/entities";
import { apiError, parseJsonBody, unauthorizedResponse } from "@/lib/http";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorizedResponse();
  const data = await getInterviews(session.user.id);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorizedResponse();
  try {
    const payload = await parseJsonBody(request);
    const data = await createInterview(session.user.id, payload);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
