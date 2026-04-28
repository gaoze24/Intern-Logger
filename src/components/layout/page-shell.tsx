import { AppSidebar, MobileSidebar } from "@/components/layout/app-sidebar";

export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex w-full flex-col">
        <header className="border-b px-4 py-3 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
            </div>
            {actions}
          </div>
        </header>
        <main className="flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-6">{children}</main>
      </div>
      <MobileSidebar />
    </div>
  );
}
