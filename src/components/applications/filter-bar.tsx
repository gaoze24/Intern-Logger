"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ApplicationStatusType } from "@prisma/client";
import { SearchInput } from "@/components/common/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ApplicationsFilterBar() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(params.get("search") ?? "");

  const statusValue = params.get("status") ?? "ALL";
  const viewValue = params.get("view") ?? "table";

  const statuses = useMemo(() => Object.values(ApplicationStatusType), []);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "ALL") next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        value={search}
        onChange={(value) => {
          setSearch(value);
          const next = new URLSearchParams(params.toString());
          if (value) next.set("search", value);
          else next.delete("search");
          router.push(`${pathname}?${next.toString()}`);
        }}
        placeholder="Search company, role, notes, recruiter..."
      />

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
