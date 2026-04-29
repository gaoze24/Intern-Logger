import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";

type ContactItem = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  linkedinUrl: string | null;
  relationshipType: string;
  followUpDate: Date | null;
  applications: {
    application: {
      id: string;
      companyName: string;
      roleTitle: string;
    };
  }[];
};

export function ContactList({ contacts }: { contacts: ContactItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact) => (
        <Card key={contact.id} className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>{contact.name}</CardTitle>
            <CardDescription className="text-[15px]">{contact.relationshipType}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-[15px]">
            <p>{contact.company ?? "—"} {contact.role ? `· ${contact.role}` : ""}</p>
            <p className="text-muted-foreground">{contact.email ?? "No email"}</p>
            <p className="text-muted-foreground">Follow-up: {formatDate(contact.followUpDate)}</p>
            <p className="text-sm text-muted-foreground">
              Linked applications: {contact.applications.map((a) => a.application.companyName).join(", ") || "None"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
