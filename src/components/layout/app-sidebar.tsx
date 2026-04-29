"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants/app";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r bg-card/50 px-4 py-6 md:flex md:flex-col">
      <div className="mb-8 px-2">
        <h2 className="text-2xl font-bold tracking-tight">{APP_NAME}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Internship productivity hub</p>
      </div>
      <nav className="space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-colors hover:bg-muted",
                active && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <Icon className="size-[18px]" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-xl border bg-background/95 p-1.5 shadow-md backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-1">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" size="sm" className="h-auto flex-col py-1.5 text-[13px]">
                <Icon className="size-[18px]" />
                {item.title.split(" ")[0]}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
