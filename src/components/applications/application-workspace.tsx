"use client";

import * as React from "react";
import { createContext, useContext, useState, useTransition } from "react";
import {
  CalendarClock,
  CheckSquare2,
  FileText,
  LinkIcon,
  ListChecks,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import type { ContactListItem, DocumentListItem } from "@/lib/services/entities";
import type { ApplicationDetail } from "@/lib/services/applications";
import {
  createContactAction,
  createDocumentAction,
  createInterviewAction,
  createTaskAction,
  createTimelineEventAction,
  completeTaskAction,
  deleteInterviewAction,
  deleteContactAction,
  deleteDocumentAction,
  deleteTaskAction,
  linkContactToApplicationAction,
  linkDocumentToApplicationAction,
  markInterviewCompleteAction,
  markThankYouSentAction,
  unlinkContactFromApplicationAction,
  unlinkDocumentFromApplicationAction,
  updateContactAction,
  updateDocumentAction,
  updateInterviewAction,
  updateTaskAction,
} from "@/actions/entities";
import { ApplicationForm } from "@/components/applications/application-form";
import { DeadlineBadge } from "@/components/applications/deadline-badge";
import { PriorityBadge } from "@/components/applications/priority-badge";
import { StatusBadge } from "@/components/applications/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DEGREE_LEVEL_LABELS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_USAGE_OPTIONS,
  getApplicationPrimaryTitle,
  getApplicationSecondaryTitle,
  getDocumentTypeOptions,
  getModeLabels,
  getRelationshipTypeOptions,
  getSourceOptions,
  INTAKE_TERM_LABELS,
  formatEnumLabel,
  INTERVIEW_OUTCOME_LABELS,
  INTERVIEW_OUTCOME_OPTIONS,
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_TYPE_OPTIONS,
  RELATIONSHIP_TYPE_LABELS,
  SOURCE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_OPTIONS,
  TIMELINE_EVENT_TYPE_LABELS,
  TIMELINE_EVENT_TYPE_OPTIONS,
  WORK_MODE_LABELS,
  UNIVERSITY_DOCUMENT_USAGE_OPTIONS,
  type ApplicationMode,
} from "@/constants/app";
import { formatDate } from "@/lib/utils/date";
import { suggestNextAction } from "@/lib/utils/next-action";
import { toast } from "sonner";
import type {
  Contact,
  Document,
  Interview,
  InterviewOutcome,
  InterviewType,
  RelationshipType,
  Source,
  Task,
  TaskPriority,
  TimelineEventType,
} from "@prisma/client";
import { isActionResult, type FieldErrors } from "@/lib/errors";

type WorkspaceProps = {
  application: ApplicationDetail;
  contacts: ContactListItem[];
  documents: DocumentListItem[];
  initialTab?: string;
};

type DialogFormProps = {
  title: string;
  description: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  onSubmit: (formData: FormData) => Promise<unknown>;
};

const FormErrorContext = createContext<FieldErrors>({});

function getChildFieldName(children: React.ReactNode) {
  if (React.isValidElement<{ name?: string }>(children)) return children.props.name;
  const childArray = React.Children.toArray(children);
  const namedChild = childArray.find((child) => React.isValidElement<{ name?: string }>(child) && child.props.name);
  return React.isValidElement<{ name?: string }>(namedChild) ? namedChild.props.name : undefined;
}

function optional(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : undefined;
}

function optionalDate(value: FormDataEntryValue | null) {
  const text = optional(value);
  return text ? new Date(text) : undefined;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = optional(value);
  return text ? Number(text) : undefined;
}

function toDateInput(date: Date | null | undefined) {
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function toDateTimeInput(date: Date | null | undefined) {
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function FormDialog({ title, description, trigger, children, onSubmit }: DialogFormProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setFormError(null);
          setFieldErrors({});
        }
      }}
    >
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setFormError(null);
            setFieldErrors({});
            const formData = new FormData(event.currentTarget);
            startTransition(async () => {
              try {
                const result = await onSubmit(formData);
                if (isActionResult(result) && !result.ok) {
                  setFormError(result.message);
                  setFieldErrors(result.fieldErrors ?? {});
                  toast.error(result.message);
                  return;
                }
                toast.success(isActionResult(result) ? (result.message ?? "Saved") : "Saved");
                setOpen(false);
              } catch {
                const message = "Could not save your changes. Please try again.";
                setFormError(message);
                toast.error(message);
              }
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {formError ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p> : null}
          <FormErrorContext.Provider value={fieldErrors}>{children}</FormErrorContext.Provider>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const fieldErrors = useContext(FormErrorContext);
  const fieldName = getChildFieldName(children);
  const message = fieldName ? fieldErrors[fieldName]?.[0] : undefined;
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
    </div>
  );
}

function NativeSelect({
  name,
  defaultValue,
  children,
}: {
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
    >
      {children}
    </select>
  );
}

function TabHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

function AddInterviewDialog({ applicationId }: { applicationId: string }) {
  return (
    <InterviewDialog
      applicationId={applicationId}
      trigger={
        <Button size="sm">
          <Plus className="size-4" />
          Add Interview
        </Button>
      }
    />
  );
}

function InterviewDialog({
  applicationId,
  interview,
  trigger,
}: {
  applicationId: string;
  interview?: Interview;
  trigger: React.ReactNode;
}) {
  const isEdit = Boolean(interview);
  return (
    <FormDialog
      title={isEdit ? "Edit interview" : "Add interview"}
      description="Track the round, schedule, notes, outcome, and follow-up state."
      trigger={trigger}
      onSubmit={async (formData) => {
        const data = {
          applicationId,
          title: String(formData.get("title") || "").trim(),
          type: formData.get("type") as InterviewType,
          scheduledAt: new Date(String(formData.get("scheduledAt"))),
          durationMinutes: optionalNumber(formData.get("durationMinutes")),
          location: optional(formData.get("location")),
          meetingLink: optional(formData.get("meetingLink")),
          interviewerName: optional(formData.get("interviewerName")),
          interviewerEmail: optional(formData.get("interviewerEmail")),
          preparationNotes: optional(formData.get("preparationNotes")),
          questionsAsked: optional(formData.get("questionsAsked")),
          reflection: optional(formData.get("reflection")),
          outcome: formData.get("outcome") as InterviewOutcome,
          followUpRequired: formData.get("followUpRequired") === "on",
          thankYouSent: formData.get("thankYouSent") === "on",
        };
        if (interview) return updateInterviewAction(interview.id, data);
        return createInterviewAction(data);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <Input name="title" required autoFocus defaultValue={interview?.title ?? ""} />
        </Field>
        <Field label="Type">
          <NativeSelect name="type" defaultValue={interview?.type ?? "TECHNICAL_INTERVIEW"}>
            {INTERVIEW_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Scheduled date and time">
          <Input
            name="scheduledAt"
            type="datetime-local"
            required
            defaultValue={toDateTimeInput(interview?.scheduledAt ?? new Date())}
          />
        </Field>
        <Field label="Duration minutes">
          <Input name="durationMinutes" type="number" min={1} max={480} defaultValue={interview?.durationMinutes ?? ""} />
        </Field>
        <Field label="Location">
          <Input name="location" defaultValue={interview?.location ?? ""} />
        </Field>
        <Field label="Meeting link">
          <Input name="meetingLink" type="url" defaultValue={interview?.meetingLink ?? ""} />
        </Field>
        <Field label="Interviewer name">
          <Input name="interviewerName" defaultValue={interview?.interviewerName ?? ""} />
        </Field>
        <Field label="Interviewer email">
          <Input name="interviewerEmail" type="email" defaultValue={interview?.interviewerEmail ?? ""} />
        </Field>
        <Field label="Outcome">
          <NativeSelect name="outcome" defaultValue={interview?.outcome ?? "PENDING"}>
            {INTERVIEW_OUTCOME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <Field label="Preparation notes">
        <Textarea name="preparationNotes" defaultValue={interview?.preparationNotes ?? ""} />
      </Field>
      <Field label="Questions asked">
        <Textarea name="questionsAsked" defaultValue={interview?.questionsAsked ?? ""} />
      </Field>
      <Field label="Reflection">
        <Textarea name="reflection" defaultValue={interview?.reflection ?? ""} />
      </Field>
      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input name="followUpRequired" type="checkbox" defaultChecked={interview?.followUpRequired ?? false} />
          Follow-up required
        </label>
        <label className="flex items-center gap-2">
          <input name="thankYouSent" type="checkbox" defaultChecked={interview?.thankYouSent ?? false} />
          Thank-you sent
        </label>
      </div>
    </FormDialog>
  );
}

function TaskDialog({
  applicationId,
  applicationType,
  task,
  trigger,
}: {
  applicationId: string;
  applicationType: ApplicationMode;
  task?: Task;
  trigger: React.ReactNode;
}) {
  return (
    <FormDialog
      title={task ? "Edit task" : "Add task"}
      description="Track an application-specific action item."
      trigger={trigger}
      onSubmit={async (formData) => {
        const data = {
          applicationType,
          applicationId,
          title: String(formData.get("title") || "").trim(),
          description: optional(formData.get("description")),
          dueDate: optionalDate(formData.get("dueDate")),
          priority: formData.get("priority") as TaskPriority,
          completed: formData.get("completed") === "on",
        };
        if (task) return updateTaskAction(task.id, data);
        return createTaskAction(data);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <Input name="title" required autoFocus defaultValue={task?.title ?? ""} />
        </Field>
        <Field label="Due date">
          <Input name="dueDate" type="date" defaultValue={toDateInput(task?.dueDate)} />
        </Field>
        <Field label="Priority">
          <NativeSelect name="priority" defaultValue={task?.priority ?? "MEDIUM"}>
            {TASK_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <Field label="Description">
        <Textarea name="description" defaultValue={task?.description ?? ""} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input name="completed" type="checkbox" defaultChecked={task?.completed ?? false} />
        Completed
      </label>
    </FormDialog>
  );
}

function ContactDialog({
  applicationType,
  contact,
  trigger,
  onSave,
}: {
  applicationType: ApplicationMode;
  contact?: Contact;
  trigger: React.ReactNode;
  onSave: (data: Record<string, unknown>) => Promise<unknown>;
}) {
  const labels = getModeLabels(applicationType);
  return (
    <FormDialog
      title={contact ? "Edit contact" : "Create contact"}
      description={
        applicationType === "UNIVERSITY"
          ? "Manage admissions officers, professors, recommenders, and program contacts."
          : "Manage recruiter, referral, alumni, or interviewer details."
      }
      trigger={trigger}
      onSubmit={async (formData) => {
        return onSave({
          applicationType,
          name: String(formData.get("name") || "").trim(),
          company: optional(formData.get("company")),
          role: optional(formData.get("role")),
          email: optional(formData.get("email")),
          linkedinUrl: optional(formData.get("linkedinUrl")),
          relationshipType: formData.get("relationshipType") as RelationshipType,
          source: optional(formData.get("source")) as Source | undefined,
          notes: optional(formData.get("notes")),
          lastContactedAt: optionalDate(formData.get("lastContactedAt")),
          followUpDate: optionalDate(formData.get("followUpDate")),
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <Input name="name" required autoFocus defaultValue={contact?.name ?? ""} />
        </Field>
        <Field label={labels.primaryField}>
          <Input name="company" defaultValue={contact?.company ?? ""} />
        </Field>
        <Field label={applicationType === "UNIVERSITY" ? "Role / relationship" : "Role"}>
          <Input name="role" defaultValue={contact?.role ?? ""} />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" defaultValue={contact?.email ?? ""} />
        </Field>
        <Field label="LinkedIn URL">
          <Input name="linkedinUrl" type="url" defaultValue={contact?.linkedinUrl ?? ""} />
        </Field>
        <Field label="Relationship">
          <NativeSelect
            name="relationshipType"
            defaultValue={contact?.relationshipType ?? (applicationType === "UNIVERSITY" ? "ADMISSIONS_OFFICER" : "RECRUITER")}
          >
            {getRelationshipTypeOptions(applicationType).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Source">
          <NativeSelect name="source" defaultValue={contact?.source ?? ""}>
            <option value="">None</option>
            {getSourceOptions(applicationType).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Last contacted">
          <Input name="lastContactedAt" type="date" defaultValue={toDateInput(contact?.lastContactedAt)} />
        </Field>
        <Field label="Follow-up date">
          <Input name="followUpDate" type="date" defaultValue={toDateInput(contact?.followUpDate)} />
        </Field>
      </div>
      <Field label="Notes">
        <Textarea name="notes" defaultValue={contact?.notes ?? ""} />
      </Field>
    </FormDialog>
  );
}

function LinkContactDialog({
  applicationId,
  applicationType,
  contacts,
}: {
  applicationId: string;
  applicationType: ApplicationMode;
  contacts: ContactListItem[];
}) {
  return (
    <FormDialog
      title="Link existing contact"
      description="Attach a saved contact to this application profile."
      trigger={<Button variant="outline" size="sm">Link Existing Contact</Button>}
      onSubmit={async (formData) => {
        return linkContactToApplicationAction(
          applicationId,
          String(formData.get("contactId")),
          optional(formData.get("relationshipToApplication")),
        );
      }}
    >
      <Field label="Contact">
        <NativeSelect name="contactId">
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name} {contact.company ? `- ${contact.company}` : ""}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Relationship to application">
        <Input
          name="relationshipToApplication"
          placeholder={applicationType === "UNIVERSITY" ? "Admissions officer, professor, recommender..." : "Recruiter, referral, interviewer..."}
        />
      </Field>
    </FormDialog>
  );
}

function DocumentDialog({
  applicationType,
  document,
  trigger,
  onSave,
}: {
  applicationType: ApplicationMode;
  document?: Document;
  trigger: React.ReactNode;
  onSave: (data: Record<string, unknown>) => Promise<unknown>;
}) {
  return (
    <FormDialog
      title={document ? "Edit document" : "Add document"}
      description={
        applicationType === "UNIVERSITY"
          ? "Store admissions documents, recommendations, test scores, and scholarship materials."
          : "Store the URL and metadata for a resume, cover letter, portfolio, or supporting file."
      }
      trigger={trigger}
      onSubmit={async (formData) => {
        return onSave({
          applicationType,
          name: String(formData.get("name") || "").trim(),
          type: formData.get("type"),
          url: String(formData.get("url") || "").trim(),
          version: optional(formData.get("version")),
          notes: optional(formData.get("notes")),
          tags: optional(formData.get("tags"))
            ?.split(",")
            .map((tag) => tag.trim())
            .filter(Boolean) ?? [],
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <Input name="name" required autoFocus defaultValue={document?.name ?? ""} />
        </Field>
        <Field label="Type">
          <NativeSelect name="type" defaultValue={document?.type ?? (applicationType === "UNIVERSITY" ? "PERSONAL_STATEMENT" : "RESUME")}>
            {getDocumentTypeOptions(applicationType).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="URL">
          <Input name="url" type="url" required defaultValue={document?.url ?? ""} />
        </Field>
        <Field label="Version">
          <Input name="version" defaultValue={document?.version ?? ""} />
        </Field>
        <Field label="Tags">
          <Input name="tags" defaultValue={document?.tags.join(", ") ?? ""} placeholder="resume, v3, submitted" />
        </Field>
      </div>
      <Field label="Notes">
        <Textarea name="notes" defaultValue={document?.notes ?? ""} />
      </Field>
    </FormDialog>
  );
}

function LinkDocumentDialog({
  applicationId,
  applicationType,
  documents,
}: {
  applicationId: string;
  applicationType: ApplicationMode;
  documents: DocumentListItem[];
}) {
  const usageOptions = applicationType === "UNIVERSITY" ? UNIVERSITY_DOCUMENT_USAGE_OPTIONS : DOCUMENT_USAGE_OPTIONS;
  return (
    <FormDialog
      title="Link existing document"
      description="Attach a saved document to this application profile."
      trigger={<Button variant="outline" size="sm">Link Existing Document</Button>}
      onSubmit={async (formData) => {
        return linkDocumentToApplicationAction(
          applicationId,
          String(formData.get("documentId")),
          optional(formData.get("usageType")),
          optional(formData.get("notes")),
        );
      }}
    >
      <Field label="Document">
        <NativeSelect name="documentId">
          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.name} - {DOCUMENT_TYPE_LABELS[document.type]}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Usage type">
        <NativeSelect name="usageType">
          {usageOptions.map((usage) => (
            <option key={usage} value={usage}>
              {usage}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Notes for this application">
        <Textarea name="notes" />
      </Field>
    </FormDialog>
  );
}

function TimelineDialog({ applicationId }: { applicationId: string }) {
  return (
    <FormDialog
      title="Add timeline note"
      description="Capture a manual event such as a follow-up email, recruiter reply, or coffee chat."
      trigger={
        <Button size="sm">
          <Plus className="size-4" />
          Add Timeline Note
        </Button>
      }
      onSubmit={async (formData) => {
        return createTimelineEventAction({
          applicationId,
          title: String(formData.get("title") || "").trim(),
          description: optional(formData.get("description")),
          type: formData.get("type") as TimelineEventType,
          occurredAt: optionalDate(formData.get("occurredAt")) ?? new Date(),
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <Input name="title" required autoFocus />
        </Field>
        <Field label="Type">
          <NativeSelect name="type" defaultValue="NOTE_ADDED">
            {TIMELINE_EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Occurred at">
          <Input name="occurredAt" type="datetime-local" defaultValue={toDateTimeInput(new Date())} />
        </Field>
      </div>
      <Field label="Description">
        <Textarea name="description" />
      </Field>
    </FormDialog>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-[15px]">{value || "-"}</div>
    </div>
  );
}

function runMutation(action: () => Promise<unknown>, success: string) {
  return async () => {
    const result = await action();
    if (isActionResult(result) && !result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(isActionResult(result) ? (result.message ?? success) : success);
  };
}

export function ApplicationWorkspace({ application, contacts, documents, initialTab = "overview" }: WorkspaceProps) {
  const [tab, setTab] = useState(initialTab);
  const [pending, startTransition] = useTransition();
  const isUniversity = application.applicationType === "UNIVERSITY";
  const labels = getModeLabels(application.applicationType);
  const primaryTitle = getApplicationPrimaryTitle(application);
  const secondaryTitle = getApplicationSecondaryTitle(application);
  const upcomingInterview = application.interviews
    .filter((interview) => interview.scheduledAt >= new Date())
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];
  const upcomingTask = application.tasks
    .filter((task) => !task.completed && task.dueDate)
    .sort((a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0))[0];
  const recentTimeline = application.timelineEvents.slice(0, 4);

  const addTaskButton = (
    <TaskDialog
      applicationId={application.id}
      applicationType={application.applicationType}
      trigger={
        <Button variant="outline" size="sm">
          <Plus className="size-4" />
          Add Task
        </Button>
      }
    />
  );

  const createContactButton = (
    <ContactDialog
      applicationType={application.applicationType}
      trigger={<Button variant="outline" size="sm">Create Contact</Button>}
      onSave={async (data) => {
        const contact = await createContactAction(data);
        if (!contact.ok) return contact;
        if (!contact.data) return { ok: false, code: "UNKNOWN_ERROR", message: "Could not create this contact. Please try again." };
        return linkContactToApplicationAction(application.id, contact.data.id, String(data.relationshipType ?? ""));
      }}
    />
  );

  const addDocumentButton = (
    <DocumentDialog
      applicationType={application.applicationType}
      trigger={<Button variant="outline" size="sm">Add Document</Button>}
      onSave={async (data) => {
        const document = await createDocumentAction(data);
        if (!document.ok) return document;
        if (!document.data) return { ok: false, code: "UNKNOWN_ERROR", message: "Could not add this document. Please try again." };
        return linkDocumentToApplicationAction(application.id, document.data.id, undefined, undefined);
      }}
    />
  );

  return (
    <div className="space-y-5">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">{primaryTitle}</CardTitle>
              <CardDescription>{secondaryTitle}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setTab("edit")}>
                Edit Application
              </Button>
              <StatusBadge status={application.status} />
              <PriorityBadge priority={application.priority} />
              <DeadlineBadge deadline={application.deadline} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <DetailRow label={labels.primaryField} value={primaryTitle} />
          <DetailRow label={labels.secondaryField} value={secondaryTitle} />
          {isUniversity ? (
            <>
              <DetailRow label="Degree level" value={application.universityDetail?.degreeLevel ? DEGREE_LEVEL_LABELS[application.universityDetail.degreeLevel] : null} />
              <DetailRow label="Faculty/department" value={application.universityDetail?.facultyOrDepartment} />
              <DetailRow label="Campus" value={application.universityDetail?.campus} />
              <DetailRow label="Country" value={application.country} />
              <DetailRow
                label="Intake"
                value={[
                  application.universityDetail?.intakeTerm ? INTAKE_TERM_LABELS[application.universityDetail.intakeTerm] : null,
                  application.universityDetail?.intakeYear,
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              <DetailRow label="Application round" value={application.universityDetail?.applicationRound} />
            </>
          ) : (
            <>
              <DetailRow label="Work mode" value={WORK_MODE_LABELS[application.workMode]} />
              <DetailRow label="Location" value={application.location} />
              <DetailRow label="Country" value={application.country} />
              <DetailRow label="Season" value={application.season ? application.season.toLowerCase() : "-"} />
            </>
          )}
          <DetailRow label="Source" value={SOURCE_LABELS[application.source]} />
          <DetailRow label={`${labels.submittedField} date`} value={formatDate(application.appliedDate)} />
          <DetailRow label="Deadline" value={formatDate(application.deadline)} />
          <DetailRow
            label={isUniversity ? "Program URL" : "Job posting"}
            value={
              application.jobPostingUrl ? (
                <a className="text-primary underline" href={application.jobPostingUrl} target="_blank" rel="noreferrer">
                  {isUniversity ? "Open program" : "Open posting"}
                </a>
              ) : null
            }
          />
          <DetailRow
            label={isUniversity ? "Portal URL" : "Application URL"}
            value={
              application.applicationUrl ? (
                <a className="text-primary underline" href={application.applicationUrl} target="_blank" rel="noreferrer">
                  Open application
                </a>
              ) : null
            }
          />
          {isUniversity ? (
            <>
              <DetailRow label="Scholarship applied" value={application.universityDetail?.scholarshipApplied ? "Yes" : "No"} />
              <DetailRow label="Funding status" value={application.universityDetail?.fundingStatus} />
            </>
          ) : (
            <DetailRow label="Referral used" value={application.referralUsed ? "Yes" : "No"} />
          )}
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        <TabsList className="max-w-full flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5">
          <TabHeader
            title="Overview"
            description="Key status, next actions, upcoming records, and application notes."
            actions={
              <>
                <AddInterviewDialog applicationId={application.id} />
                {addTaskButton}
                {createContactButton}
                {addDocumentButton}
              </>
            }
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Next action</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {suggestNextAction({
                  status: application.status,
                  updatedAt: application.updatedAt,
                  deadline: application.deadline,
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming interview</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingInterview ? (
                  <div className="space-y-1">
                    <p className="font-medium">{upcomingInterview.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(upcomingInterview.scheduledAt)}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming interview.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming task</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingTask ? (
                  <div className="space-y-1">
                    <p className="font-medium">{upcomingTask.title}</p>
                    <p className="text-sm text-muted-foreground">Due {formatDate(upcomingTask.dueDate)}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming task.</p>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTimeline.map((event) => (
                  <div key={event.id} className="border-l pl-3">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.occurredAt)}</p>
                  </div>
                ))}
                {recentTimeline.length === 0 ? <p className="text-muted-foreground">No timeline yet.</p> : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{isUniversity ? "Notes and statement prompt" : "Notes and job description"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 whitespace-pre-wrap text-muted-foreground">
                <p>{application.notes || "No notes saved yet."}</p>
                <p>
                  {isUniversity
                    ? application.universityDetail?.statementPrompt || "No statement prompt saved yet."
                    : application.jobDescription || "No job description saved yet."}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit application</CardTitle>
              <CardDescription>Update the core application details and save changes.</CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationForm
                id={application.id}
                mode={application.applicationType}
                initialValues={{
                  applicationType: application.applicationType,
                  companyName: application.companyName,
                  roleTitle: application.roleTitle,
                  institutionName: application.universityDetail?.institutionName ?? application.companyName,
                  programName: application.universityDetail?.programName ?? application.roleTitle,
                  degreeLevel: application.universityDetail?.degreeLevel ?? undefined,
                  facultyOrDepartment: application.universityDetail?.facultyOrDepartment ?? "",
                  applicationRound: application.universityDetail?.applicationRound ?? "",
                  intakeTerm: application.universityDetail?.intakeTerm ?? undefined,
                  intakeYear: application.universityDetail?.intakeYear ?? undefined,
                  campus: application.universityDetail?.campus ?? "",
                  programUrl: application.universityDetail?.programUrl ?? application.jobPostingUrl ?? "",
                  applicationPortalUrl: application.universityDetail?.applicationPortalUrl ?? application.applicationUrl ?? "",
                  tuitionEstimate: application.universityDetail?.tuitionEstimate ?? "",
                  scholarshipApplied: application.universityDetail?.scholarshipApplied ?? false,
                  fundingStatus: application.universityDetail?.fundingStatus ?? "",
                  testRequirementStatus: application.universityDetail?.testRequirementStatus ?? "",
                  recommendationRequirementStatus: application.universityDetail?.recommendationRequirementStatus ?? "",
                  statementPrompt: application.universityDetail?.statementPrompt ?? "",
                  status: application.status,
                  location: application.location ?? "",
                  country: application.country ?? "",
                  workMode: application.workMode,
                  source: application.source,
                  priority: application.priority,
                  deadline: toDateInput(application.deadline),
                  appliedDate: toDateInput(application.appliedDate),
                  submittedDate: toDateInput(application.appliedDate),
                  applicationUrl: application.applicationUrl ?? "",
                  jobPostingUrl: application.jobPostingUrl ?? "",
                  notes: application.notes ?? "",
                  archived: application.archived,
                  referralUsed: application.referralUsed,
                  jobDescription: application.jobDescription ?? "",
                  tagIds: application.tags.map((t) => t.tagId),
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-5">
          <TabHeader
            title="Timeline"
            description="A chronological history of status changes, linked records, and manual notes."
            actions={<TimelineDialog applicationId={application.id} />}
          />
          {application.timelineEvents.length ? (
            <div className="space-y-3">
              {application.timelineEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="flex gap-3 p-4">
                    <ListChecks className="mt-1 size-4 text-muted-foreground" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{event.title}</p>
                        <Badge variant="outline">{TIMELINE_EVENT_TYPE_LABELS[event.type]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(event.occurredAt)}</p>
                      {event.description ? <p className="mt-2 whitespace-pre-wrap">{event.description}</p> : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ListChecks}
              title="No timeline events yet"
              description="Add a manual note or create related records to build this application history."
              action={<TimelineDialog applicationId={application.id} />}
            />
          )}
        </TabsContent>

        <TabsContent value="interviews" className="space-y-5">
          <TabHeader
            title="Interviews"
            description="Track interview rounds, preparation notes, outcomes, and follow-ups."
            actions={<AddInterviewDialog applicationId={application.id} />}
          />
          {application.interviews.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {application.interviews.map((interview) => (
                <Card key={interview.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{interview.title}</CardTitle>
                        <CardDescription>{INTERVIEW_TYPE_LABELS[interview.type]}</CardDescription>
                      </div>
                      <Badge variant="outline">{INTERVIEW_OUTCOME_LABELS[interview.outcome]}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{formatDate(interview.scheduledAt)}</p>
                    <p>{interview.interviewerName || "No interviewer specified"}</p>
                    <p className="text-muted-foreground">{interview.meetingLink || interview.location || "No location or link"}</p>
                    <div className="flex flex-wrap gap-2">
                      {interview.followUpRequired ? <Badge variant="secondary">Follow-up required</Badge> : null}
                      <Badge variant={interview.thankYouSent ? "secondary" : "outline"}>
                        {interview.thankYouSent ? "Thank-you sent" : "Thank-you not sent"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <InterviewDialog
                        applicationId={application.id}
                        interview={interview}
                        trigger={<Button variant="outline" size="sm">Edit</Button>}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => startTransition(runMutation(() => markInterviewCompleteAction(interview.id), "Interview marked complete"))}
                      >
                        Mark Complete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pending || interview.thankYouSent}
                        onClick={() => startTransition(runMutation(() => markThankYouSentAction(interview.id), "Thank-you marked sent"))}
                      >
                        Mark Thank-you Sent
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          if (window.confirm("Delete this interview?")) {
                            startTransition(runMutation(() => deleteInterviewAction(interview.id), "Interview deleted"));
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No interviews yet"
              description="Track interview rounds such as OA, recruiter screen, technical interviews, and final rounds."
              action={<AddInterviewDialog applicationId={application.id} />}
            />
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-5">
          <TabHeader
            title="Tasks"
            description="Track application-specific action items and follow-ups."
            actions={addTaskButton}
          />
          {application.tasks.length ? (
            <div className="space-y-3">
              {application.tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={task.completed ? "font-medium line-through text-muted-foreground" : "font-medium"}>
                          {task.title}
                        </p>
                        <Badge variant="outline">{TASK_PRIORITY_LABELS[task.priority]}</Badge>
                        {task.dueDate && !task.completed && task.dueDate < new Date() ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">Due {formatDate(task.dueDate)}</p>
                      {task.description ? <p className="text-muted-foreground">{task.description}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pending || task.completed}
                        onClick={() => startTransition(runMutation(() => completeTaskAction(task.id), "Task completed"))}
                      >
                        Complete
                      </Button>
                      <TaskDialog
                        applicationType={application.applicationType}
                        applicationId={application.id}
                        task={task}
                        trigger={<Button variant="outline" size="sm">Edit</Button>}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          if (window.confirm("Delete this task?")) {
                            startTransition(runMutation(() => deleteTaskAction(task.id), "Task deleted"));
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckSquare2}
              title="No tasks yet"
              description="Add tasks such as submit application, complete OA, prepare behavioral stories, or send follow-up."
              action={addTaskButton}
            />
          )}
        </TabsContent>

        <TabsContent value="contacts" className="space-y-5">
          <TabHeader
            title="Contacts"
            description={
              isUniversity
                ? "Manage admissions officers, professors, recommenders, alumni, and program contacts for this application."
                : "Manage recruiters, referrals, interviewers, alumni, and hiring contacts for this application."
            }
            actions={
              <>
                <LinkContactDialog applicationId={application.id} applicationType={application.applicationType} contacts={contacts} />
                {createContactButton}
              </>
            }
          />
          {application.contacts.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {application.contacts.map((link) => (
                <Card key={link.contactId}>
                  <CardHeader>
                    <CardTitle className="text-base">{link.contact.name}</CardTitle>
                    <CardDescription>
                      {[link.contact.role, link.contact.company].filter(Boolean).join(" - ") || "Contact"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="outline">{RELATIONSHIP_TYPE_LABELS[link.contact.relationshipType]}</Badge>
                    <p>{link.contact.email || "No email"}</p>
                    {link.contact.linkedinUrl ? (
                      <a className="inline-flex items-center gap-1 text-primary underline" href={link.contact.linkedinUrl} target="_blank" rel="noreferrer">
                        <LinkIcon className="size-4" />
                        LinkedIn
                      </a>
                    ) : null}
                    <p className="text-sm text-muted-foreground">Last contacted: {formatDate(link.contact.lastContactedAt)}</p>
                    <p className="text-sm text-muted-foreground">Follow-up: {formatDate(link.contact.followUpDate)}</p>
                    {link.contact.notes ? <p className="text-muted-foreground">{link.contact.notes}</p> : null}
                    <div className="flex flex-wrap gap-2">
                      <ContactDialog
                        applicationType={application.applicationType}
                        contact={link.contact}
                        trigger={<Button variant="outline" size="sm">Edit</Button>}
                        onSave={async (data) => {
                          return updateContactAction(link.contactId, data);
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          if (window.confirm("Unlink this contact from the application?")) {
                            startTransition(runMutation(() => unlinkContactFromApplicationAction(application.id, link.contactId), "Contact unlinked"));
                          }
                        }}
                      >
                        Unlink
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          if (window.confirm("Delete this contact globally? This removes it from every linked application.")) {
                            startTransition(runMutation(() => deleteContactAction(link.contactId), "Contact deleted"));
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No contacts linked"
              description={
                isUniversity
                  ? "Link admissions officers, professors, recommenders, or program contacts related to this application."
                  : "Link recruiters, referrals, alumni, or interviewers related to this application."
              }
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <LinkContactDialog applicationId={application.id} applicationType={application.applicationType} contacts={contacts} />
                  {createContactButton}
                </div>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-5">
          <TabHeader
            title="Documents"
            description={
              isUniversity
                ? "Track statements, transcripts, recommendations, test scores, and scholarship materials."
                : "Track resumes, cover letters, transcripts, portfolios, and files used for this application."
            }
            actions={
              <>
                <LinkDocumentDialog applicationId={application.id} applicationType={application.applicationType} documents={documents} />
                {addDocumentButton}
              </>
            }
          />
          {application.documents.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {application.documents.map((link) => (
                <Card key={link.documentId}>
                  <CardHeader>
                    <CardTitle className="text-base">{link.document.name}</CardTitle>
                    <CardDescription>{DOCUMENT_TYPE_LABELS[link.document.type]}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {link.document.version ? <Badge variant="outline">{link.document.version}</Badge> : null}
                      {link.usageType ? <Badge variant="secondary">{link.usageType}</Badge> : null}
                    </div>
                    <a className="inline-flex items-center gap-1 text-primary underline" href={link.document.url} target="_blank" rel="noreferrer">
                      <LinkIcon className="size-4" />
                      Open document
                    </a>
                    {link.document.notes ? <p className="text-muted-foreground">{link.document.notes}</p> : null}
                    {link.notes ? <p className="text-sm text-muted-foreground">Application note: {link.notes}</p> : null}
                    <div className="flex flex-wrap gap-2">
                      <DocumentDialog
                        applicationType={application.applicationType}
                        document={link.document}
                        trigger={<Button variant="outline" size="sm">Edit</Button>}
                        onSave={async (data) => {
                          return updateDocumentAction(link.documentId, data);
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          if (window.confirm("Unlink this document from the application?")) {
                            startTransition(runMutation(() => unlinkDocumentFromApplicationAction(application.id, link.documentId), "Document unlinked"));
                          }
                        }}
                      >
                        Unlink
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          if (window.confirm("Delete this document globally? This removes it from every linked application.")) {
                            startTransition(runMutation(() => deleteDocumentAction(link.documentId), "Document deleted"));
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No documents linked"
              description={
                isUniversity
                  ? "Attach the statement, transcript, recommendation, test score, or scholarship material for this application."
                  : "Attach the resume, cover letter, transcript, or portfolio used for this application."
              }
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <LinkDocumentDialog applicationId={application.id} applicationType={application.applicationType} documents={documents} />
                  {addDocumentButton}
                </div>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-5">
          <TabHeader
            title="Activity"
            description="System activity recorded for this application."
          />
          {application.activities.length ? (
            <div className="space-y-3">
              {application.activities.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <p className="font-medium">
                      {formatEnumLabel(item.action)} - {formatEnumLabel(item.entityType)}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ListChecks}
              title="No activity yet"
              description="System activity appears here after updates, links, and completed tasks."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
