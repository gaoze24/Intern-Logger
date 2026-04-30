import { redirect } from "next/navigation";
import { getVerifiedSessionUserId } from "@/lib/auth-helpers";

export async function getCurrentUserIdOrRedirect() {
  const userId = await getVerifiedSessionUserId();
  if (!userId) redirect("/auth/signin");
  return userId;
}
