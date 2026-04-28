import { Download } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportCsvDialog } from "@/components/settings/import-csv-dialog";

export default function SettingsPage() {
  return (
    <PageShell title="Settings" description="Profile, preferences, and data controls">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Configure your school and target role details.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Profile preferences are backed by the UserSettings model and ready for expanded UI controls.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data export</CardTitle>
            <CardDescription>Export your internship tracker data as JSON or CSV.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
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
