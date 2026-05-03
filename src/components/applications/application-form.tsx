"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createApplicationAction, updateApplicationAction } from "@/actions/applications";
import { applicationSchema } from "@/lib/validations/application";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DEGREE_LEVEL_OPTIONS,
  getModeLabels,
  getSourceOptions,
  getStatusOptions,
  INTAKE_TERM_OPTIONS,
  PRIORITY_OPTIONS,
  WORK_MODE_OPTIONS,
  type ApplicationMode,
} from "@/constants/app";
import { ApplicationStatusType, ApplicationType, Priority } from "@prisma/client";
import { z } from "zod";
import type { FieldErrors } from "@/lib/errors";

type FormValues = z.input<typeof applicationSchema>;
type FormOutput = z.output<typeof applicationSchema>;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function BooleanField({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex min-h-11 items-center gap-2 rounded-lg border px-3 text-[15px]">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(Boolean(value))} />
      {label}
    </label>
  );
}

export function ApplicationForm({
  initialValues,
  id,
  mode = "JOB",
}: {
  initialValues?: Partial<FormValues>;
  id?: string;
  mode?: ApplicationMode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const activeMode = (initialValues?.applicationType as ApplicationMode | undefined) ?? mode;
  const labels = getModeLabels(activeMode);
  const form = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicationType: activeMode,
      companyName: "",
      roleTitle: "",
      institutionName: "",
      programName: "",
      status: activeMode === ApplicationType.UNIVERSITY ? ApplicationStatusType.RESEARCHING : ApplicationStatusType.WISHLIST,
      workMode: "UNKNOWN",
      source: "OTHER",
      priority: Priority.MEDIUM,
      referralUsed: false,
      scholarshipApplied: false,
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
      <input type="hidden" {...form.register("applicationType")} />

      {activeMode === "UNIVERSITY" ? (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution name</Label>
              <Input
                id="institutionName"
                aria-invalid={Boolean(form.formState.errors.institutionName)}
                {...form.register("institutionName")}
              />
              <FieldError message={form.formState.errors.institutionName?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="programName">Program name</Label>
              <Input id="programName" aria-invalid={Boolean(form.formState.errors.programName)} {...form.register("programName")} />
              <FieldError message={form.formState.errors.programName?.message} />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Degree level</Label>
              <Controller
                control={form.control}
                name="degreeLevel"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value || undefined)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREE_LEVEL_OPTIONS.map((option) => (
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
              <Label htmlFor="facultyOrDepartment">Faculty/department</Label>
              <Input id="facultyOrDepartment" {...form.register("facultyOrDepartment")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campus">Campus/city</Label>
              <Input id="campus" {...form.register("campus")} />
            </div>
          </div>
        </>
      ) : (
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
      )}

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
                  {getStatusOptions(activeMode).map((option) => (
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
                  {getSourceOptions(activeMode).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {activeMode === "JOB" ? (
        <div className="grid gap-5 md:grid-cols-3">
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...form.register("location")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...form.register("country")} />
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...form.register("country")} />
          </div>
          <div className="space-y-2">
            <Label>Intake term</Label>
            <Controller
              control={form.control}
              name="intakeTerm"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value || undefined)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTAKE_TERM_OPTIONS.map((option) => (
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
            <Label htmlFor="intakeYear">Intake year</Label>
            <Input id="intakeYear" type="number" min={2000} max={2100} {...form.register("intakeYear")} />
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="deadline">{activeMode === "UNIVERSITY" ? "Application deadline" : "Deadline"}</Label>
          <Input id="deadline" type="date" {...form.register("deadline")} />
          <FieldError message={form.formState.errors.deadline?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={activeMode === "UNIVERSITY" ? "submittedDate" : "appliedDate"}>{labels.submittedField} date</Label>
          <Input
            id={activeMode === "UNIVERSITY" ? "submittedDate" : "appliedDate"}
            type="date"
            {...form.register(activeMode === "UNIVERSITY" ? "submittedDate" : "appliedDate")}
          />
        </div>
      </div>

      {activeMode === "UNIVERSITY" ? (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="applicationRound">Application round</Label>
              <Input id="applicationRound" {...form.register("applicationRound")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuitionEstimate">Tuition estimate</Label>
              <Input id="tuitionEstimate" {...form.register("tuitionEstimate")} />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="programUrl">Program URL</Label>
              <Input id="programUrl" placeholder="https://..." {...form.register("programUrl")} />
              <FieldError message={form.formState.errors.programUrl?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicationPortalUrl">Application portal URL</Label>
              <Input id="applicationPortalUrl" placeholder="https://..." {...form.register("applicationPortalUrl")} />
              <FieldError message={form.formState.errors.applicationPortalUrl?.message} />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Controller
              control={form.control}
              name="scholarshipApplied"
              render={({ field }) => (
                <BooleanField
                  id="scholarshipApplied"
                  label="Scholarship applied"
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fundingStatus">Funding status</Label>
              <Input id="fundingStatus" {...form.register("fundingStatus")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="statementPrompt">Statement prompt</Label>
            <Textarea id="statementPrompt" rows={4} {...form.register("statementPrompt")} />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="applicationUrl">Application URL</Label>
              <Input id="applicationUrl" placeholder="https://..." {...form.register("applicationUrl")} />
              <FieldError message={form.formState.errors.applicationUrl?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobPostingUrl">Job posting URL</Label>
              <Input id="jobPostingUrl" placeholder="https://..." {...form.register("jobPostingUrl")} />
              <FieldError message={form.formState.errors.jobPostingUrl?.message} />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Controller
              control={form.control}
              name="referralUsed"
              render={({ field }) => (
                <BooleanField id="referralUsed" label="Referral used" checked={Boolean(field.value)} onCheckedChange={field.onChange} />
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="compensation">Compensation</Label>
              <Input id="compensation" {...form.register("compensation")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job description</Label>
            <Textarea id="jobDescription" rows={4} {...form.register("jobDescription")} />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={5} {...form.register("notes")} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : id ? `Update ${labels.single}` : `Create ${labels.single}`}
      </Button>
    </form>
  );
}
