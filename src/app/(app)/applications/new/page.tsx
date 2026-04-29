import { ApplicationStatusType } from "@prisma/client";
import { PageShell } from "@/components/layout/page-shell";
import { ApplicationForm } from "@/components/applications/application-form";

function getInitialStatus(value: string | string[] | undefined) {
  return typeof value === "string" && Object.values(ApplicationStatusType).includes(value as ApplicationStatusType)
    ? (value as ApplicationStatusType)
    : undefined;
}

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initialStatus = getInitialStatus((await searchParams).status);

  return (
    <PageShell title="Add application" description="Create a new internship application entry">
      <div className="mx-auto max-w-3xl rounded-xl border p-6 shadow-sm">
        <ApplicationForm initialValues={initialStatus ? { status: initialStatus } : undefined} />
      </div>
    </PageShell>
  );
}
