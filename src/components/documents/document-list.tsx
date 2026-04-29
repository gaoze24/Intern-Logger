import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DOCUMENT_TYPE_LABELS } from "@/constants/app";
import type { DocumentType } from "@prisma/client";

type DocumentItem = {
  id: string;
  name: string;
  type: DocumentType;
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>{doc.name}</CardTitle>
            <CardDescription className="text-[15px]">{DOCUMENT_TYPE_LABELS[doc.type]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-[15px]">
            <a href={doc.url} target="_blank" rel="noreferrer" className="text-primary underline">
              Open link
            </a>
            <p>Version: {doc.version ?? "—"}</p>
            <p className="text-muted-foreground">{doc.notes ?? "No notes"}</p>
            <p className="text-sm text-muted-foreground">Tags: {doc.tags.join(", ") || "None"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
