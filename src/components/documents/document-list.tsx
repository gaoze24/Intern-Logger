import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  url: string;
  version: string | null;
  notes: string | null;
  tags: string[];
  applications: {
    application: {
      id: string;
      companyName: string;
      roleTitle: string;
    };
  }[];
};

export function DocumentList({ documents }: { documents: DocumentItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{doc.name}</CardTitle>
            <CardDescription>{doc.type}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <a href={doc.url} target="_blank" rel="noreferrer" className="text-primary underline">
              Open link
            </a>
            <p>Version: {doc.version ?? "—"}</p>
            <p className="text-muted-foreground">{doc.notes ?? "No notes"}</p>
            <p className="text-xs text-muted-foreground">Tags: {doc.tags.join(", ") || "None"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
