"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md space-y-3 rounded-xl border p-6 text-center shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">Could not load this page</h2>
        <p className="text-[15px] text-muted-foreground">Refresh the page or try again in a moment.</p>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </main>
  );
}
