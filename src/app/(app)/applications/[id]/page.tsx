import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { ApplicationWorkspace } from "@/components/applications/application-workspace";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getApplicationById } from "@/lib/services/applications";
import { getContacts, getDocuments } from "@/lib/services/entities";
import { ExportDialog } from "@/components/common/export-dialog";

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
        initialTab={initialTab}
      />
    </PageShell>
  );
}
