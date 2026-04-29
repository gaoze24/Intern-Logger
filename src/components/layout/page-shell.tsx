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
      <div className="flex min-w-0 w-full flex-col">
        <header className="border-b px-5 py-4 md:px-8 md:py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
              {description ? <p className="mt-1 text-base text-muted-foreground">{description}</p> : null}
            </div>
            {actions}
          </div>
        </header>
        <main className="min-w-0 flex-1 px-5 pb-28 pt-5 md:px-8 md:pb-8 md:pt-6">{children}</main>
      </div>
      <MobileSidebar />
    </div>
  );
}
