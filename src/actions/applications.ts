"use server";

import { revalidatePath } from "next/cache";
import { ApplicationStatusType } from "@prisma/client";
import {
  archiveApplication,
  bulkUpdateApplications,
  changeApplicationStatus,
  createApplication,
  deleteApplication,
  updateApplication,
} from "@/lib/services/applications";
import { requireUserId } from "@/lib/auth-helpers";

export async function createApplicationAction(input: unknown) {
  const userId = await requireUserId();
  const result = await createApplication(userId, input);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return result;
}

export async function updateApplicationAction(id: string, input: unknown) {
  const userId = await requireUserId();
  const result = await updateApplication(userId, id, input);
  revalidatePath(`/applications/${id}`);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteApplicationAction(id: string) {
  const userId = await requireUserId();
  const result = await deleteApplication(userId, id);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return result;
}

export async function archiveApplicationAction(id: string) {
  const userId = await requireUserId();
  const result = await archiveApplication(userId, id);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return result;
}

export async function changeApplicationStatusAction(id: string, status: ApplicationStatusType, note?: string) {
  const userId = await requireUserId();
  const result = await changeApplicationStatus(userId, id, status, note);
  revalidatePath("/kanban");
  revalidatePath(`/applications/${id}`);
  revalidatePath("/dashboard");
  return result;
}

export async function bulkUpdateApplicationsAction(
  ids: string[],
  update: Partial<{ status: ApplicationStatusType; archived: boolean }>,
) {
  const userId = await requireUserId();
  const result = await bulkUpdateApplications(userId, ids, update);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return result;
}
