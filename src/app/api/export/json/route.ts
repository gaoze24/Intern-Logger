import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { exportJson } from "@/lib/services/applications";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await exportJson(session.user.id);
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="applications.json"',
    },
  });
}
