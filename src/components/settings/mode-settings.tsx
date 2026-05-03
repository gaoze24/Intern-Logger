"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { updateApplicationModeAction } from "@/actions/settings";
import { APPLICATION_MODES, type ApplicationMode } from "@/constants/app";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ApplicationModeControl({ mode }: { mode: ApplicationMode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {APPLICATION_MODES.map((item) => (
          <button
            key={item.value}
            type="button"
            disabled={pending}
            onClick={() => {
              if (item.value === mode) return;
              startTransition(async () => {
                const result = await updateApplicationModeAction(item.value);
                if (!result.ok) {
                  toast.error(result.message);
                  return;
                }
                toast.success(result.message ?? `Switched to ${item.label}.`);
                router.refresh();
              });
            }}
            className={cn(
              "rounded-lg border p-4 text-left transition hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60",
              item.value === mode && "border-primary bg-primary/5",
            )}
          >
            <span className="block font-medium">{item.label}</span>
            <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await signOut({ callbackUrl: "/auth/signin" });
          } catch {
            toast.error("Could not log out. Please try again.");
          }
        });
      }}
    >
      <LogOut className="mr-1 size-4" />
      {pending ? "Logging out..." : "Log out"}
    </Button>
  );
}
