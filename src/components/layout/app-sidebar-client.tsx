"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function SidebarNavLinks() {
  const pathname = usePathname();

  return (
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
  );
}

export function MobileSidebarNav() {
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
