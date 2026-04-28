import { PageShell } from "@/components/layout/page-shell";
import { ApplicationForm } from "@/components/applications/application-form";

export default function NewApplicationPage() {
  return (
    <PageShell title="Add application" description="Create a new internship application entry">
      <div className="mx-auto max-w-3xl rounded-xl border p-4">
        <ApplicationForm />
      </div>
    </PageShell>
  );
}
