"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmailTemplate, type TemplateType } from "@/lib/email-templates";
import { toast } from "sonner";

const TEMPLATE_OPTIONS: { value: TemplateType; label: string }[] = [
  { value: "recruiter-follow-up", label: "Recruiter follow-up" },
  { value: "thank-you", label: "Thank-you after interview" },
  { value: "referral-request", label: "Referral request" },
  { value: "networking-message", label: "Networking message" },
  { value: "coffee-chat", label: "Coffee chat request" },
  { value: "interview-availability", label: "Interview availability response" },
  { value: "offer-negotiation", label: "Offer negotiation starter" },
  { value: "offer-acceptance", label: "Offer acceptance" },
  { value: "offer-rejection", label: "Offer rejection" },
  { value: "application-withdrawal", label: "Application withdrawal" },
];

export default function EmailTemplatesPage() {
  const [type, setType] = useState<TemplateType>("recruiter-follow-up");
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [specificTopicDiscussed, setSpecificTopicDiscussed] = useState("");
  const [userName, setUserName] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  const body = useMemo(
    () =>
      generateEmailTemplate(type, {
        contactName,
        companyName,
        roleTitle,
        interviewDate,
        specificTopicDiscussed,
        userName,
        customNotes,
      }),
    [type, contactName, companyName, roleTitle, interviewDate, specificTopicDiscussed, userName, customNotes],
  );

  return (
    <PageShell title="Email templates" description="Generate editable, copyable career communication templates">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6 shadow-sm">
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={type} onValueChange={(value) => setType(value as TemplateType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Contact</Label><Input value={contactName} onChange={(e) => setContactName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Role</Label><Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>Interview date</Label><Input value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>User name</Label><Input value={userName} onChange={(e) => setUserName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Specific topic</Label><Input value={specificTopicDiscussed} onChange={(e) => setSpecificTopicDiscussed(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <Label>Custom notes</Label>
            <Textarea rows={4} value={customNotes} onChange={(e) => setCustomNotes(e.target.value)} />
          </div>
        </div>
        <div className="space-y-3 rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">Preview</h3>
            <Button
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(body);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="mr-1 size-4" />
              Copy
            </Button>
          </div>
          <Textarea value={body} onChange={() => {}} rows={22} />
        </div>
      </div>
    </PageShell>
  );
}
