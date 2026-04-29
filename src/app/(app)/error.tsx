"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md space-y-3 rounded-xl border p-6 text-center shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">Something went wrong</h2>
        <p className="text-[15px] text-muted-foreground">{error.message || "Unexpected error"}</p>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </main>
  );
}
