"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth-helpers";
import { updateApplicationMode } from "@/lib/services/settings";
import { APPLICATION_MODES } from "@/constants/app";
import { ok, toActionError } from "@/lib/errors";

const MODE_AWARE_PATHS = [
  "/dashboard",
  "/applications",
  "/kanban",
  "/calendar",
  "/tasks",
  "/contacts",
  "/documents",
  "/analytics",
  "/email-templates",
  "/settings",
];

export async function updateApplicationModeAction(mode: unknown) {
  try {
    const userId = await requireUserId();
    const settings = await updateApplicationMode(userId, mode);
    MODE_AWARE_PATHS.forEach((path) => revalidatePath(path));
    const label = APPLICATION_MODES.find((item) => item.value === settings.applicationMode)?.label ?? "Job Applications";
    return ok(settings, `Switched to ${label}.`);
  } catch (error) {
    return toActionError(error, "Could not update application mode. Please try again.");
  }
}
