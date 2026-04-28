import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/applications/status-badge";
import { PriorityBadge } from "@/components/applications/priority-badge";
import { DeadlineBadge } from "@/components/applications/deadline-badge";
import { ApplicationForm } from "@/components/applications/application-form";
import { Timeline } from "@/components/applications/timeline";
import { ActivityLog } from "@/components/applications/activity-log";
import { TaskList } from "@/components/tasks/task-list";
import { ContactList } from "@/components/contacts/contact-list";
import { DocumentList } from "@/components/documents/document-list";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getApplicationById } from "@/lib/services/applications";
import { formatDate } from "@/lib/utils/date";
import { ExportDialog } from "@/components/common/export-dialog";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserIdOrRedirect();
  const { id } = await params;
  const application = await getApplicationById(userId, id);
  if (!application) notFound();

  return (
    <PageShell
      title={`${application.companyName} · ${application.roleTitle}`}
      description="Full application profile"
      actions={<ExportDialog />}
    >
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
              <span>{application.companyName}</span>
              <StatusBadge status={application.status} />
              <PriorityBadge priority={application.priority} />
              <DeadlineBadge deadline={application.deadline} />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-2">
            <p><span className="text-muted-foreground">Location:</span> {application.location ?? "—"}</p>
            <p><span className="text-muted-foreground">Work mode:</span> {application.workMode}</p>
            <p><span className="text-muted-foreground">Season:</span> {application.season ?? "—"}</p>
            <p><span className="text-muted-foreground">Applied date:</span> {formatDate(application.appliedDate)}</p>
            <p className="md:col-span-2"><span className="text-muted-foreground">Source:</span> {application.source}</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job description</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
                {application.jobDescription || "No job description saved yet."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
                {application.notes || "No notes yet."}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Edit application</CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationForm
                  id={application.id}
                  initialValues={{
                    companyName: application.companyName,
                    roleTitle: application.roleTitle,
                    status: application.status,
                    location: application.location ?? "",
                    country: application.country ?? "",
                    workMode: application.workMode,
                    source: application.source,
                    priority: application.priority,
                    applicationUrl: application.applicationUrl ?? "",
                    jobPostingUrl: application.jobPostingUrl ?? "",
                    notes: application.notes ?? "",
                    archived: application.archived,
                    referralUsed: application.referralUsed,
                    tagIds: application.tags.map((t) => t.tagId),
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Timeline items={application.timelineEvents} />
          </TabsContent>

          <TabsContent value="interviews">
            <div className="space-y-2">
              {application.interviews.map((interview) => (
                <Card key={interview.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{interview.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>{interview.type.replaceAll("_", " ")}</p>
                    <p>{formatDate(interview.scheduledAt)}</p>
                    <p>{interview.interviewerName ?? "No interviewer specified"}</p>
                  </CardContent>
                </Card>
              ))}
              {application.interviews.length === 0 ? <p className="text-sm text-muted-foreground">No interviews yet.</p> : null}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <TaskList tasks={application.tasks.map((task) => ({ ...task, application: { companyName: application.companyName, roleTitle: application.roleTitle } }))} />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactList contacts={application.contacts.map((c) => ({ ...c.contact, applications: [] }))} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentList documents={application.documents.map((d) => ({ ...d.document, applications: [] }))} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLog items={application.activities} />
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}
