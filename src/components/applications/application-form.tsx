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
import {
  APPLICATION_SOURCE_OPTIONS,
  APPLICATION_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  WORK_MODE_OPTIONS,
} from "@/constants/app";
import { ApplicationStatusType, Priority } from "@prisma/client";
import { z } from "zod";
import type { FieldErrors } from "@/lib/errors";

type FormValues = z.input<typeof applicationSchema>;
type FormOutput = z.output<typeof applicationSchema>;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

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

  const applyServerFieldErrors = (fieldErrors?: FieldErrors) => {
    Object.entries(fieldErrors ?? {}).forEach(([field, messages]) => {
      const message = messages[0];
      if (message) {
        form.setError(field as keyof FormValues, { type: "server", message });
      }
    });
  };

  const onSubmit = (values: FormOutput) => {
    startTransition(async () => {
      if (id) {
        const result = await updateApplicationAction(id, values);
        if (!result.ok) {
          applyServerFieldErrors(result.fieldErrors);
          toast.error(result.message);
          return;
        }
        toast.success(result.message ?? "Application updated");
        router.refresh();
        return;
      }
      const result = await createApplicationAction(values);
      if (!result.ok) {
        applyServerFieldErrors(result.fieldErrors);
        toast.error(result.message);
        return;
      }
      toast.success(result.message ?? "Application created");
      if (result.data?.duplicates.length) {
        toast.warning(`Potential duplicates found: ${result.data.duplicates.length}`);
      }
      if (result.data?.created.id) {
        router.push(`/applications/${result.data.created.id}`);
      } else {
        router.push("/applications");
      }
    });
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company</Label>
          <Input id="companyName" aria-invalid={Boolean(form.formState.errors.companyName)} {...form.register("companyName")} />
          <FieldError message={form.formState.errors.companyName?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="roleTitle">Role title</Label>
          <Input id="roleTitle" aria-invalid={Boolean(form.formState.errors.roleTitle)} {...form.register("roleTitle")} />
          <FieldError message={form.formState.errors.roleTitle?.message} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value as ApplicationStatusType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={form.formState.errors.status?.message} />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Controller
            control={form.control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value as Priority)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={form.formState.errors.priority?.message} />
        </div>
        <div className="space-y-2">
          <Label>Work mode</Label>
          <Controller
            control={form.control}
            name="workMode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value as FormValues["workMode"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_MODE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={form.formState.errors.workMode?.message} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...form.register("location")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...form.register("country")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Source</Label>
        <Controller
          control={form.control}
          name="source"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(value) => field.onChange(value as FormValues["source"])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
          <Label htmlFor="applicationUrl">Application URL</Label>
        <Input
          id="applicationUrl"
          placeholder="https://..."
          aria-invalid={Boolean(form.formState.errors.applicationUrl)}
          {...form.register("applicationUrl")}
        />
        <FieldError message={form.formState.errors.applicationUrl?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobPostingUrl">Job posting URL</Label>
        <Input
          id="jobPostingUrl"
          placeholder="https://..."
          aria-invalid={Boolean(form.formState.errors.jobPostingUrl)}
          {...form.register("jobPostingUrl")}
        />
        <FieldError message={form.formState.errors.jobPostingUrl?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={5} {...form.register("notes")} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : id ? "Update application" : "Create application"}
      </Button>
    </form>
  );
}
