import { APP_NAME } from "@/constants/app";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { MobileSidebarNav, SidebarNavLinks } from "@/components/layout/app-sidebar-client";

export function AppSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r bg-card/50 px-4 py-6 md:flex md:flex-col">
      <div className="mb-8 px-2">
        <h2 className="text-2xl font-bold tracking-tight">{APP_NAME}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Track jobs and university applications</p>
      </div>
      <SidebarNavLinks />
      <div className="mt-auto flex items-center justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  return <MobileSidebarNav />;
}
