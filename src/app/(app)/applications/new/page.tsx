import { ApplicationStatusType } from "@prisma/client";
import { PageShell } from "@/components/layout/page-shell";
import { ApplicationForm } from "@/components/applications/application-form";
import { getModeLabels, isStatusAllowedForMode } from "@/constants/app";
import { getCurrentApplicationMode } from "@/lib/services/settings";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";

function getInitialStatus(value: string | string[] | undefined, mode: "JOB" | "UNIVERSITY") {
  return typeof value === "string" &&
    Object.values(ApplicationStatusType).includes(value as ApplicationStatusType) &&
    isStatusAllowedForMode(value as ApplicationStatusType, mode)
    ? (value as ApplicationStatusType)
    : undefined;
}

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getCurrentUserIdOrRedirect();
  const mode = await getCurrentApplicationMode(userId);
  const labels = getModeLabels(mode);
  const initialStatus = getInitialStatus((await searchParams).status, mode);

  return (
    <PageShell title={labels.add} description={`Create a new ${labels.single.toLowerCase()} entry`}>
      <div className="mx-auto max-w-3xl rounded-xl border p-6 shadow-sm">
        <ApplicationForm
          mode={mode}
          initialValues={{
            applicationType: mode,
            ...(initialStatus ? { status: initialStatus } : {}),
          }}
        />
      </div>
    </PageShell>
  );
}
