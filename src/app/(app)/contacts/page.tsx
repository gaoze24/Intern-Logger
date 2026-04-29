import { PageShell } from "@/components/layout/page-shell";
import { ContactList } from "@/components/contacts/contact-list";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getContacts } from "@/lib/services/entities";
import { PaginationControls } from "@/components/common/pagination-controls";
import { SearchParamInput } from "@/components/common/search-param-input";

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

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getCurrentUserIdOrRedirect();
  const params = await searchParams;
  const search = getParam(params, "search");
  const contacts = await getContacts(userId, {
    search,
    page: getPage(getParam(params, "page")),
    pageSize: getPageSize(getParam(params, "pageSize")),
  });

  return (
    <PageShell title="Contacts / Networking" description="Track recruiters, alumni, referrals, and interviewers">
      <div className="space-y-5">
        <SearchParamInput placeholder="Search contacts, companies, emails..." />
        <ContactList contacts={contacts.items} />
        <PaginationControls
          basePath="/contacts"
          page={contacts.page}
          pageSize={contacts.pageSize}
          total={contacts.total}
          totalPages={contacts.totalPages}
          params={{ search }}
        />
      </div>
    </PageShell>
  );
}
