"use server";

import { revalidatePath } from "next/cache";
import { ApplicationStatusType } from "@prisma/client";
import {
  archiveApplication,
  bulkArchiveApplications,
  bulkDeleteApplications,
  bulkRestoreApplications,
  bulkUpdateApplications,
  changeApplicationStatus,
  createApplication,
  deleteApplication,
  restoreApplication,
  updateApplication,
} from "@/lib/services/applications";
import { requireUserId } from "@/lib/auth-helpers";
import { ok, toActionError } from "@/lib/errors";

export async function createApplicationAction(input: unknown) {
  try {
    const userId = await requireUserId();
    const result = await createApplication(userId, input);
    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return ok(result, "Application saved.");
  } catch (error) {
    return toActionError(error, "Could not save this application. Please try again.");
  }
}

export async function updateApplicationAction(id: string, input: unknown) {
  try {
    const userId = await requireUserId();
    const result = await updateApplication(userId, id, input);
    revalidatePath(`/applications/${id}`);
    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return ok(result, "Application updated.");
  } catch (error) {
    return toActionError(error, "Could not update this application. Please try again.");
  }
}

export async function deleteApplicationAction(id: string) {
  try {
    const userId = await requireUserId();
    const result = await deleteApplication(userId, id);
    revalidatePath("/applications");
    revalidatePath(`/applications/${id}`);
    revalidatePath("/kanban");
    revalidatePath("/calendar");
    revalidatePath("/contacts");
    revalidatePath("/documents");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return ok(result, "Application deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete this application. Please try again.", "DELETE_FAILED");
  }
}

export async function archiveApplicationAction(id: string) {
  try {
    const userId = await requireUserId();
    const result = await archiveApplication(userId, id);
    revalidatePath("/applications");
    revalidatePath(`/applications/${id}`);
    revalidatePath("/kanban");
    revalidatePath("/dashboard");
    return ok(result, "Application archived.");
  } catch (error) {
    return toActionError(error, "Could not archive this application. Please try again.");
  }
}

export async function restoreApplicationAction(id: string) {
  try {
    const userId = await requireUserId();
    const result = await restoreApplication(userId, id);
    revalidatePath("/applications");
    revalidatePath(`/applications/${id}`);
    revalidatePath("/kanban");
    revalidatePath("/dashboard");
    return ok(result, "Application restored.");
  } catch (error) {
    return toActionError(error, "Could not restore this application. Please try again.");
  }
}

export async function changeApplicationStatusAction(id: string, status: ApplicationStatusType, note?: string) {
  try {
    const userId = await requireUserId();
    const result = await changeApplicationStatus(userId, id, status, note);
    revalidatePath("/kanban");
    revalidatePath(`/applications/${id}`);
    revalidatePath("/dashboard");
    return ok(result, "Status updated.");
  } catch (error) {
    return toActionError(error, "Could not update this status. Please try again.");
  }
}

export async function bulkUpdateApplicationsAction(
  ids: string[],
  update: Partial<{ status: ApplicationStatusType; archived: boolean }>,
) {
  try {
    const userId = await requireUserId();
    const result = await bulkUpdateApplications(userId, ids, update);
    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return ok(result, "Applications updated.");
  } catch (error) {
    return toActionError(error, "Could not update these applications. Please try again.");
  }
}

export async function bulkArchiveApplicationsAction(ids: string[]) {
  try {
    const userId = await requireUserId();
    const result = await bulkArchiveApplications(userId, ids);
    revalidatePath("/applications");
    revalidatePath("/kanban");
    revalidatePath("/dashboard");
    return ok(result, "Applications archived.");
  } catch (error) {
    return toActionError(error, "Could not archive these applications. Please try again.");
  }
}

export async function bulkRestoreApplicationsAction(ids: string[]) {
  try {
    const userId = await requireUserId();
    const result = await bulkRestoreApplications(userId, ids);
    revalidatePath("/applications");
    revalidatePath("/kanban");
    revalidatePath("/dashboard");
    return ok(result, "Applications restored.");
  } catch (error) {
    return toActionError(error, "Could not restore these applications. Please try again.");
  }
}

export async function bulkDeleteApplicationsAction(ids: string[]) {
  try {
    const userId = await requireUserId();
    const result = await bulkDeleteApplications(userId, ids);
    revalidatePath("/applications");
    revalidatePath("/kanban");
    revalidatePath("/calendar");
    revalidatePath("/contacts");
    revalidatePath("/documents");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return ok(result, "Applications deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete these applications. Please try again.", "DELETE_FAILED");
  }
}
