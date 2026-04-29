"use server";

import { revalidatePath } from "next/cache";
import {
  completeTask,
  createContact,
  createDocument,
  createInterview,
  createTask,
  createTimelineEventEntry,
  deleteContact,
  deleteDocument,
  deleteInterview,
  deleteTask,
  linkContactToApplication,
  linkDocumentToApplication,
  markInterviewComplete,
  markThankYouSent,
  unlinkContactFromApplication,
  unlinkDocumentFromApplication,
  updateContact,
  updateDocument,
  updateInterview,
  updateTask,
} from "@/lib/services/entities";
import { requireUserId } from "@/lib/auth-helpers";
import { ok, toActionError } from "@/lib/errors";

export async function createInterviewAction(input: unknown) {
  try {
    const userId = await requireUserId();
    const result = await createInterview(userId, input);
    revalidatePath("/applications");
    revalidatePath(`/applications/${result.applicationId}`);
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    return ok(result, "Interview added.");
  } catch (error) {
    return toActionError(error, "Could not add the interview. Please try again.");
  }
}

export async function updateInterviewAction(id: string, input: unknown) {
  try {
    const userId = await requireUserId();
    const result = await updateInterview(userId, id, input);
    revalidatePath("/applications");
    revalidatePath(`/applications/${result.applicationId}`);
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    return ok(result, "Interview updated.");
  } catch (error) {
    return toActionError(error, "Could not update the interview. Please try again.");
  }
}

export async function deleteInterviewAction(id: string) {
  try {
    const userId = await requireUserId();
    const result = await deleteInterview(userId, id);
    revalidatePath("/applications");
    revalidatePath(`/applications/${result.applicationId}`);
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    return ok(result, "Interview deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete the interview. Please try again.", "DELETE_FAILED");
  }
}

export async function markInterviewCompleteAction(id: string) {
  try {
    const userId = await requireUserId();
    const result = await markInterviewComplete(userId, id);
    revalidatePath(`/applications/${result.applicationId}`);
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    return ok(result, "Interview marked complete.");
  } catch (error) {
    return toActionError(error, "Could not mark this interview as complete. Please try again.");
  }
}

export async function markThankYouSentAction(id: string) {
  try {
    const userId = await requireUserId();
    const result = await markThankYouSent(userId, id);
    revalidatePath(`/applications/${result.applicationId}`);
    return ok(result, "Thank-you marked sent.");
  } catch (error) {
    return toActionError(error, "Could not mark thank-you as sent. Please try again.");
  }
}

export async function createTaskAction(input: unknown) {
  try {
    const userId = await requireUserId();
    const result = await createTask(userId, input);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    if (result.applicationId) revalidatePath(`/applications/${result.applicationId}`);
    return ok(result, "Task added.");
  } catch (error) {
    return toActionError(error, "Could not add the task. Please try again.");
  }
}

export async function updateTaskAction(id: string, input: unknown) {
  try {
    const userId = await requireUserId();
    const result = await updateTask(userId, id, input);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    if (result.applicationId) revalidatePath(`/applications/${result.applicationId}`);
    return ok(result, "Task updated.");
  } catch (error) {
    return toActionError(error, "Could not update the task. Please try again.");
  }
}

export async function completeTaskAction(id: string) {
  try {
    const userId = await requireUserId();
    const result = await completeTask(userId, id);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    if (result.applicationId) revalidatePath(`/applications/${result.applicationId}`);
    return ok(result, "Task completed.");
  } catch (error) {
    return toActionError(error, "Could not mark this task as complete. Please try again.");
  }
}

export async function deleteTaskAction(id: string) {
  try {
    const userId = await requireUserId();
    const result = await deleteTask(userId, id);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    if (result.applicationId) revalidatePath(`/applications/${result.applicationId}`);
    return ok(result, "Task deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete this task. Please try again.", "DELETE_FAILED");
  }
}

export async function createContactAction(input: unknown) {
  try {
    const userId = await requireUserId();
    const result = await createContact(userId, input);
    revalidatePath("/contacts");
    revalidatePath("/dashboard");
    return ok(result, "Contact created.");
  } catch (error) {
    return toActionError(error, "Could not create this contact. Please try again.");
  }
}

export async function updateContactAction(id: string, input: unknown) {
  try {
    const userId = await requireUserId();
    const result = await updateContact(userId, id, input);
    revalidatePath("/contacts");
    revalidatePath("/dashboard");
    return ok(result, "Contact updated.");
  } catch (error) {
    return toActionError(error, "Could not update this contact. Please try again.");
  }
}

export async function deleteContactAction(id: string) {
  try {
    const userId = await requireUserId();
    const result = await deleteContact(userId, id);
    revalidatePath("/contacts");
    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return ok(result, "Contact deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete this contact. Please try again.", "DELETE_FAILED");
  }
}

export async function linkContactToApplicationAction(
  applicationId: string,
  contactId: string,
  relationshipToApplication?: string,
) {
  try {
    const userId = await requireUserId();
    const result = await linkContactToApplication(userId, applicationId, contactId, relationshipToApplication);
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath("/contacts");
    revalidatePath("/dashboard");
    return ok(result, "Contact linked.");
  } catch (error) {
    return toActionError(error, "Could not link this contact to the application.", "LINK_FAILED");
  }
}

export async function unlinkContactFromApplicationAction(applicationId: string, contactId: string) {
  try {
    const userId = await requireUserId();
    const result = await unlinkContactFromApplication(userId, applicationId, contactId);
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath("/contacts");
    revalidatePath("/dashboard");
    return ok(result, "Contact unlinked.");
  } catch (error) {
    return toActionError(error, "Could not unlink this contact. Please try again.", "LINK_FAILED");
  }
}

export async function createDocumentAction(input: unknown) {
  try {
    const userId = await requireUserId();
    const result = await createDocument(userId, input);
    revalidatePath("/documents");
    return ok(result, "Document added.");
  } catch (error) {
    return toActionError(error, "Could not add this document. Please try again.");
  }
}

export async function updateDocumentAction(id: string, input: unknown) {
  try {
    const userId = await requireUserId();
    const result = await updateDocument(userId, id, input);
    revalidatePath("/documents");
    return ok(result, "Document updated.");
  } catch (error) {
    return toActionError(error, "Could not update this document. Please try again.");
  }
}

export async function deleteDocumentAction(id: string) {
  try {
    const userId = await requireUserId();
    const result = await deleteDocument(userId, id);
    revalidatePath("/documents");
    revalidatePath("/applications");
    return ok(result, "Document deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete this document. Please try again.", "DELETE_FAILED");
  }
}

export async function linkDocumentToApplicationAction(
  applicationId: string,
  documentId: string,
  usageType?: string,
  notes?: string,
) {
  try {
    const userId = await requireUserId();
    const result = await linkDocumentToApplication(userId, applicationId, documentId, usageType, notes);
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath("/documents");
    return ok(result, "Document linked.");
  } catch (error) {
    return toActionError(error, "Could not link this document to the application.", "LINK_FAILED");
  }
}

export async function unlinkDocumentFromApplicationAction(applicationId: string, documentId: string) {
  try {
    const userId = await requireUserId();
    const result = await unlinkDocumentFromApplication(userId, applicationId, documentId);
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath("/documents");
    return ok(result, "Document unlinked.");
  } catch (error) {
    return toActionError(error, "Could not unlink this document. Please try again.", "LINK_FAILED");
  }
}

export async function createTimelineEventAction(input: unknown) {
  try {
    const userId = await requireUserId();
    const result = await createTimelineEventEntry(userId, input);
    revalidatePath(`/applications/${result.applicationId}`);
    return ok(result, "Timeline note added.");
  } catch (error) {
    return toActionError(error, "Could not add this timeline note. Please try again.");
  }
}
