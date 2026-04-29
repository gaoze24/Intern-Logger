"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@/components/common/search-input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

type SearchParamInputProps = {
  placeholder?: string;
};

export function SearchParamInput({ placeholder }: SearchParamInputProps) {
  const params = useSearchParams();
  const currentSearch = params.get("search") ?? "";

  return <SearchParamInputInner key={currentSearch} initialSearch={currentSearch} placeholder={placeholder} />;
}

function SearchParamInputInner({
  initialSearch,
  placeholder,
}: SearchParamInputProps & {
  initialSearch: string;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    if (debouncedSearch === initialSearch) return;
    const next = new URLSearchParams(params.toString());
    if (debouncedSearch) next.set("search", debouncedSearch);
    else next.delete("search");
    next.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  }, [debouncedSearch, initialSearch, params, pathname, router]);

  return <SearchInput value={search} onChange={setSearch} placeholder={placeholder} />;
}
