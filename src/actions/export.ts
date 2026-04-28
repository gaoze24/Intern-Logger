"use server";

import { requireUserId } from "@/lib/auth-helpers";
import { exportJson, getApplications } from "@/lib/services/applications";
import { toApplicationsCsv } from "@/lib/csv/applications";

export async function exportApplicationsJsonAction() {
  const userId = await requireUserId();
  return exportJson(userId);
}

export async function exportApplicationsCsvAction() {
  const userId = await requireUserId();
  const applications = await getApplications(userId, { includeArchived: true });
  return toApplicationsCsv(applications);
}
