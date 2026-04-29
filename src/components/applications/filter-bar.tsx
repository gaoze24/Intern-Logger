"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ApplicationStatusType } from "@prisma/client";
import { SearchParamInput } from "@/components/common/search-param-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ApplicationsFilterBar() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusValue = params.get("status") ?? "ALL";
  const viewValue = params.get("view") ?? "table";

  const statuses = useMemo(() => Object.values(ApplicationStatusType), []);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "ALL") next.delete(key);
    else next.set(key, value);
    next.set("page", "1");
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchParamInput placeholder="Search company, role, notes, recruiter..." />

      <Select value={statusValue} onValueChange={(value) => updateParam("status", value ?? "")}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Filter status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={viewValue} onValueChange={(value) => updateParam("view", value ?? "")}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="View" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="table">Table</SelectItem>
          <SelectItem value="kanban">Kanban</SelectItem>
          <SelectItem value="compact">Compact</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
