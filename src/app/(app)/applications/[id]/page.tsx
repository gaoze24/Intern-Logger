import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { ApplicationWorkspace } from "@/components/applications/application-workspace";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getApplicationById } from "@/lib/services/applications";
import { getContacts, getDocuments } from "@/lib/services/entities";
import { ExportDialog } from "@/components/common/export-dialog";
import { getApplicationDisplayName, getModeLabels } from "@/constants/app";

function getInitialTab(searchParams: Record<string, string | string[] | undefined>) {
  const tab = searchParams.tab;
  return typeof tab === "string" && tab === "edit" ? tab : "overview";
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getCurrentUserIdOrRedirect();
  const { id } = await params;
  const initialTab = getInitialTab(await searchParams);
  const application = await getApplicationById(userId, id);
  if (!application) notFound();
  const [contacts, documents] = await Promise.all([
    getContacts(userId, { applicationType: application.applicationType, pageSize: 100 }),
    getDocuments(userId, { applicationType: application.applicationType, pageSize: 100 }),
  ]);
  const labels = getModeLabels(application.applicationType);

  return (
    <PageShell
      title={getApplicationDisplayName(application)}
      description={`${labels.single} profile`}
      actions={<ExportDialog />}
    >
      <ApplicationWorkspace
        application={application}
        contacts={contacts.items}
        documents={documents.items}
        initialTab={initialTab}
      />
    </PageShell>
  );
}
