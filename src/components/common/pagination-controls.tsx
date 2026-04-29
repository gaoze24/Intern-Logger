import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationControlsProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | number | undefined>;
};

const PAGE_SIZES = [25, 50, 100];

function hrefFor(basePath: string, params: Record<string, string | number | undefined>, updates: Record<string, string | number>) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, ...updates })) {
    if (value !== undefined && value !== "") next.set(key, String(value));
  }
  const query = next.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function PaginationControls({
  page,
  pageSize,
  total,
  totalPages,
  basePath,
  params = {},
}: PaginationControlsProps) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-sm md:flex-row md:items-center md:justify-between">
      <p className="text-muted-foreground">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">Rows</span>
        {PAGE_SIZES.map((size) => (
          <Link
            key={size}
            href={hrefFor(basePath, params, { page: 1, pageSize: size })}
            className={cn(
              buttonVariants({ variant: size === pageSize ? "default" : "outline", size: "sm" }),
              "min-w-12",
            )}
          >
            {size}
          </Link>
        ))}
        <Link
          href={hrefFor(basePath, params, { page: Math.max(1, page - 1), pageSize })}
          aria-disabled={page <= 1}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), page <= 1 && "pointer-events-none opacity-50")}
        >
          Previous
        </Link>
        <Link
          href={hrefFor(basePath, params, { page: Math.min(totalPages, page + 1), pageSize })}
          aria-disabled={page >= totalPages}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page >= totalPages && "pointer-events-none opacity-50",
          )}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
