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

export async function createInterviewAction(input: unknown) {
  const userId = await requireUserId();
  const result = await createInterview(userId, input);
  revalidatePath("/applications");
  revalidatePath(`/applications/${result.applicationId}`);
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return result;
}

export async function updateInterviewAction(id: string, input: unknown) {
  const userId = await requireUserId();
  const result = await updateInterview(userId, id, input);
  revalidatePath("/applications");
  revalidatePath(`/applications/${result.applicationId}`);
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return result;
}

export async function deleteInterviewAction(id: string) {
  const userId = await requireUserId();
  const result = await deleteInterview(userId, id);
  revalidatePath("/applications");
  revalidatePath(`/applications/${result.applicationId}`);
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return result;
}

export async function markInterviewCompleteAction(id: string) {
  const userId = await requireUserId();
  const result = await markInterviewComplete(userId, id);
  revalidatePath(`/applications/${result.applicationId}`);
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return result;
}

export async function markThankYouSentAction(id: string) {
  const userId = await requireUserId();
  const result = await markThankYouSent(userId, id);
  revalidatePath(`/applications/${result.applicationId}`);
  return result;
}

export async function createTaskAction(input: unknown) {
  const userId = await requireUserId();
  const result = await createTask(userId, input);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (result.applicationId) revalidatePath(`/applications/${result.applicationId}`);
  return result;
}

export async function updateTaskAction(id: string, input: unknown) {
  const userId = await requireUserId();
  const result = await updateTask(userId, id, input);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (result.applicationId) revalidatePath(`/applications/${result.applicationId}`);
  return result;
}

export async function completeTaskAction(id: string) {
  const userId = await requireUserId();
  const result = await completeTask(userId, id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (result.applicationId) revalidatePath(`/applications/${result.applicationId}`);
  return result;
}

export async function deleteTaskAction(id: string) {
  const userId = await requireUserId();
  const result = await deleteTask(userId, id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (result.applicationId) revalidatePath(`/applications/${result.applicationId}`);
  return result;
}

export async function createContactAction(input: unknown) {
  const userId = await requireUserId();
  const result = await createContact(userId, input);
  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  return result;
}

export async function updateContactAction(id: string, input: unknown) {
  const userId = await requireUserId();
  const result = await updateContact(userId, id, input);
  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteContactAction(id: string) {
  const userId = await requireUserId();
  const result = await deleteContact(userId, id);
  revalidatePath("/contacts");
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return result;
}

export async function linkContactToApplicationAction(
  applicationId: string,
  contactId: string,
  relationshipToApplication?: string,
) {
  const userId = await requireUserId();
  const result = await linkContactToApplication(userId, applicationId, contactId, relationshipToApplication);
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  return result;
}

export async function unlinkContactFromApplicationAction(applicationId: string, contactId: string) {
  const userId = await requireUserId();
  const result = await unlinkContactFromApplication(userId, applicationId, contactId);
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  return result;
}

export async function createDocumentAction(input: unknown) {
  const userId = await requireUserId();
  const result = await createDocument(userId, input);
  revalidatePath("/documents");
  return result;
}

export async function updateDocumentAction(id: string, input: unknown) {
  const userId = await requireUserId();
  const result = await updateDocument(userId, id, input);
  revalidatePath("/documents");
  return result;
}

export async function deleteDocumentAction(id: string) {
  const userId = await requireUserId();
  const result = await deleteDocument(userId, id);
  revalidatePath("/documents");
  revalidatePath("/applications");
  return result;
}

export async function linkDocumentToApplicationAction(
  applicationId: string,
  documentId: string,
  usageType?: string,
  notes?: string,
) {
  const userId = await requireUserId();
  const result = await linkDocumentToApplication(userId, applicationId, documentId, usageType, notes);
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/documents");
  return result;
}

export async function unlinkDocumentFromApplicationAction(applicationId: string, documentId: string) {
  const userId = await requireUserId();
  const result = await unlinkDocumentFromApplication(userId, applicationId, documentId);
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/documents");
  return result;
}

export async function createTimelineEventAction(input: unknown) {
  const userId = await requireUserId();
  const result = await createTimelineEventEntry(userId, input);
  revalidatePath(`/applications/${result.applicationId}`);
  return result;
}
