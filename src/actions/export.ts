"use server";

import { requireUserId } from "@/lib/auth-helpers";
import { exportJson, getApplications } from "@/lib/services/applications";
import { toApplicationsCsv } from "@/lib/csv/applications";
import { getCurrentApplicationMode } from "@/lib/services/settings";

export async function exportApplicationsJsonAction() {
  const userId = await requireUserId();
  const mode = await getCurrentApplicationMode(userId);
  return exportJson(userId, mode);
}

export async function exportApplicationsCsvAction() {
  const userId = await requireUserId();
  const mode = await getCurrentApplicationMode(userId);
  const applications = await getApplications(userId, { includeArchived: true, applicationType: mode });
  return toApplicationsCsv(applications);
}
