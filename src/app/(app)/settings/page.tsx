import { Download } from "lucide-react";
import { getServerSession } from "next-auth";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportCsvDialog } from "@/components/settings/import-csv-dialog";
import { ApplicationModeControl, LogoutButton } from "@/components/settings/mode-settings";
import { getCurrentUserIdOrRedirect } from "@/lib/server-user";
import { getUserSettings } from "@/lib/services/settings";
import { authOptions } from "@/lib/auth";

export default async function SettingsPage() {
  const userId = await getCurrentUserIdOrRedirect();
  const [settings, session] = await Promise.all([getUserSettings(userId), getServerSession(authOptions)]);

  return (
    <PageShell title="Settings" description="Profile, preferences, and data controls">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">Application Mode</CardTitle>
            <CardDescription>Choose what type of applications you want to manage.</CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationModeControl mode={settings.applicationMode} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">Account</CardTitle>
            <CardDescription>Manage your signed-in session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-[15px]">
              <p className="font-medium">{session?.user?.name ?? session?.user?.email ?? "Signed in"}</p>
              {session?.user?.email ? <p className="text-muted-foreground">{session.user.email}</p> : null}
            </div>
            <LogoutButton />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">Data export</CardTitle>
            <CardDescription>Export your application tracker data as JSON or CSV.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action="/api/export/json" method="get">
              <Button type="submit" variant="outline" className="w-full justify-start">
                <Download className="mr-1 size-4" />
                Export JSON
              </Button>
            </form>
            <form action="/api/export/csv" method="get">
              <Button type="submit" variant="outline" className="w-full justify-start">
                <Download className="mr-1 size-4" />
                Export CSV
              </Button>
            </form>
            <ImportCsvDialog />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
