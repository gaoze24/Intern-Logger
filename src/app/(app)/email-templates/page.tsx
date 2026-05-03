import { PageShell } from "@/components/layout/page-shell";
import { EmailTemplateWorkbench } from "@/components/email-templates/email-template-workbench";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getCurrentApplicationMode } from "@/lib/services/settings";
import { getModeLabels } from "@/constants/app";

export default async function EmailTemplatesPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const mode = await getCurrentApplicationMode(userId);
  const labels = getModeLabels(mode);

  return (
    <PageShell title="Email templates" description={`Generate editable templates for your ${labels.modeLabel.toLowerCase()}`}>
      <EmailTemplateWorkbench mode={mode} />
    </PageShell>
  );
}
