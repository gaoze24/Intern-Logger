import { PageShell } from "@/components/layout/page-shell";
import { ContactList } from "@/components/contacts/contact-list";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getContacts } from "@/lib/services/entities";

export default async function ContactsPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const contacts = await getContacts(userId);

  return (
    <PageShell title="Contacts / Networking" description="Track recruiters, alumni, referrals, and interviewers">
      <ContactList contacts={contacts} />
    </PageShell>
  );
}
