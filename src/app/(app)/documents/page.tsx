import { PageShell } from "@/components/layout/page-shell";
import { DocumentList } from "@/components/documents/document-list";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getDocuments } from "@/lib/services/entities";

export default async function DocumentsPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const documents = await getDocuments(userId);

  return (
    <PageShell title="Documents" description="Track resume versions, cover letters, and supporting links">
      <DocumentList documents={documents} />
    </PageShell>
  );
}
