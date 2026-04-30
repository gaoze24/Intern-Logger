import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getVerifiedSessionUserId() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  return user?.id ?? null;
}

export async function requireUserId() {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}
