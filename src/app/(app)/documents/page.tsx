import { PageShell } from "@/components/layout/page-shell";
import { DocumentList } from "@/components/documents/document-list";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getDocuments } from "@/lib/services/entities";
import { PaginationControls } from "@/components/common/pagination-controls";

const VALID_PAGE_SIZES = new Set([25, 50, 100]);

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
}

function getPage(value: string | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getPageSize(value: string | undefined) {
  const pageSize = Number(value);
  return VALID_PAGE_SIZES.has(pageSize) ? pageSize : 25;
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getCurrentUserIdOrRedirect();
  const params = await searchParams;
  const documents = await getDocuments(userId, {
    page: getPage(getParam(params, "page")),
    pageSize: getPageSize(getParam(params, "pageSize")),
  });

  return (
    <PageShell title="Documents" description="Track resume versions, cover letters, and supporting links">
      <div className="space-y-5">
        <DocumentList documents={documents.items} />
        <PaginationControls
          basePath="/documents"
          page={documents.page}
          pageSize={documents.pageSize}
          total={documents.total}
          totalPages={documents.totalPages}
        />
      </div>
    </PageShell>
  );
}
