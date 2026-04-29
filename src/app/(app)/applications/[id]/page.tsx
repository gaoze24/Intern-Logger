import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { ApplicationWorkspace } from "@/components/applications/application-workspace";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getApplicationById } from "@/lib/services/applications";
import { getContacts, getDocuments } from "@/lib/services/entities";
import { ExportDialog } from "@/components/common/export-dialog";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserIdOrRedirect();
  const { id } = await params;
  const [application, contacts, documents] = await Promise.all([
    getApplicationById(userId, id),
    getContacts(userId, { pageSize: 100 }),
    getDocuments(userId, { pageSize: 100 }),
  ]);
  if (!application) notFound();

  return (
    <PageShell
      title={`${application.companyName} · ${application.roleTitle}`}
      description="Full application profile"
      actions={<ExportDialog />}
    >
      <ApplicationWorkspace
        application={application}
        contacts={contacts.items}
        documents={documents.items}
      />
    </PageShell>
  );
}
