"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchParamInput } from "@/components/common/search-param-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APPLICATION_STATUS_OPTIONS } from "@/constants/app";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ApplicationCounts,
  ApplicationListTab,
  ApplicationSortKey,
  ApplicationSortOrder,
} from "@/lib/services/applications";

const SORT_OPTIONS: { value: `${ApplicationSortKey}:${ApplicationSortOrder}`; label: string }[] = [
  { value: "deadline:asc", label: "Deadline: soonest first" },
  { value: "deadline:desc", label: "Deadline: latest first" },
  { value: "appliedDate:desc", label: "Applied date: newest first" },
  { value: "appliedDate:asc", label: "Applied date: oldest first" },
  { value: "updatedAt:desc", label: "Last updated: newest first" },
  { value: "updatedAt:asc", label: "Last updated: oldest first" },
  { value: "companyName:asc", label: "Company: A to Z" },
  { value: "companyName:desc", label: "Company: Z to A" },
  { value: "roleTitle:asc", label: "Role: A to Z" },
  { value: "roleTitle:desc", label: "Role: Z to A" },
  { value: "priority:desc", label: "Priority: high to low" },
  { value: "priority:asc", label: "Priority: low to high" },
  { value: "status:asc", label: "Status: pipeline order" },
  { value: "createdAt:desc", label: "Created date: newest first" },
  { value: "createdAt:asc", label: "Created date: oldest first" },
];

type ApplicationsFilterBarProps = {
  tab: ApplicationListTab;
  counts: ApplicationCounts;
  sort: ApplicationSortKey;
  order: ApplicationSortOrder;
};

export function ApplicationsFilterBar({ tab, counts, sort, order }: ApplicationsFilterBarProps) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusValue = params.get("status") ?? "ALL";
  const viewValue = params.get("view") ?? "table";
  const sortValue = `${sort}:${order}` as const;

  const statuses = useMemo(
    () => APPLICATION_STATUS_OPTIONS.filter((option) => tab !== "active" || option.value !== "ARCHIVED"),
    [tab],
  );

  const hrefWith = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "ALL") next.delete(key);
      else next.set(key, value);
    }
    next.set("page", "1");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const updateParam = (key: string, value: string) => {
    if (key === "view" && value === "kanban") {
      router.push("/kanban");
      return;
    }
    const next = new URLSearchParams(params.toString());
    if (!value || value === "ALL") next.delete(key);
    else next.set(key, value);
    next.set("page", "1");
    router.push(`${pathname}?${next.toString()}`);
  };

  const updateSort = (value: string | null) => {
    if (!value) return;
    const [nextSort, nextOrder] = value.split(":");
    const next = new URLSearchParams(params.toString());
    next.set("sort", nextSort);
    next.set("order", nextOrder);
    next.set("page", "1");
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { value: "active" as const, label: `Active (${counts.active})` },
          { value: "archived" as const, label: `Archived (${counts.archived})` },
          { value: "all" as const, label: `All (${counts.all})` },
        ].map((item) => (
          <Link
            key={item.value}
            href={hrefWith({ tab: item.value })}
            className={cn(
              buttonVariants({ variant: tab === item.value ? "default" : "outline", size: "sm" }),
              "min-w-24",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[280px] flex-1">
          <SearchParamInput placeholder="Search company, role, notes..." />
        </div>

        <Select value={statusValue} onValueChange={(value) => updateParam("status", value ?? "")}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Status: All</SelectItem>
            {statuses.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortValue} onValueChange={updateSort}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={viewValue} onValueChange={(value) => updateParam("view", value ?? "")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="table">Table</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="kanban">Kanban</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
