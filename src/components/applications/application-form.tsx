"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createApplicationAction, updateApplicationAction } from "@/actions/applications";
import { applicationSchema } from "@/lib/validations/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SOURCES, WORK_MODES } from "@/constants/app";
import { ApplicationStatusType, Priority } from "@prisma/client";
import { z } from "zod";

type FormValues = z.input<typeof applicationSchema>;
type FormOutput = z.output<typeof applicationSchema>;

export function ApplicationForm({ initialValues, id }: { initialValues?: Partial<FormValues>; id?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyName: "",
      roleTitle: "",
      status: ApplicationStatusType.WISHLIST,
      workMode: "UNKNOWN",
      source: "OTHER",
      priority: Priority.MEDIUM,
      referralUsed: false,
      archived: false,
      tagIds: [],
      ...initialValues,
    },
  });

  const onSubmit = (values: FormOutput) => {
    startTransition(async () => {
      try {
        if (id) {
          await updateApplicationAction(id, values);
          toast.success("Application updated");
          router.refresh();
          return;
        }
        const result = await createApplicationAction(values);
        toast.success("Application created");
        if (result.duplicates.length > 0) {
          toast.warning(`Potential duplicates found: ${result.duplicates.length}`);
        }
        router.push(`/applications/${result.created.id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save");
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Company</Label>
          <Input id="companyName" {...form.register("companyName")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="roleTitle">Role title</Label>
          <Input id="roleTitle" {...form.register("roleTitle")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value as ApplicationStatusType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ApplicationStatusType).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Controller
            control={form.control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Priority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Work mode</Label>
          <Controller
            control={form.control}
            name="workMode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value as FormValues["workMode"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_MODES.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...form.register("location")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...form.register("country")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Source</Label>
        <Controller
          control={form.control}
          name="source"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(value) => field.onChange(value as FormValues["source"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="applicationUrl">Application URL</Label>
        <Input id="applicationUrl" placeholder="https://..." {...form.register("applicationUrl")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="jobPostingUrl">Job posting URL</Label>
        <Input id="jobPostingUrl" placeholder="https://..." {...form.register("jobPostingUrl")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={5} {...form.register("notes")} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : id ? "Update application" : "Create application"}
      </Button>
    </form>
  );
}
