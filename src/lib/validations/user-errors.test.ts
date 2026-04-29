import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";
import { applicationSchema } from "@/lib/validations/application";
import { contactSchema, documentSchema } from "@/lib/validations/entities";
import { validateApplicationsCsvRows } from "@/lib/csv/applications";
import { signUpAction } from "@/actions/auth";

describe("user-facing validation messages", () => {
  it("explains short sign-up passwords", () => {
    const result = signUpSchema.safeParse({ name: "Eddie", email: "eddie@example.com", password: "short" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toContain("Password must be at least 8 characters.");
  });

  it("returns sign-up password field errors before saving", async () => {
    const result = await signUpAction({ name: "Eddie", email: "eddie@example.com", password: "short" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.password).toContain("Password must be at least 8 characters.");
    }
  });

  it("explains invalid auth emails", () => {
    const result = signInSchema.safeParse({ email: "not-email", password: "anything" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.email).toContain("Enter a valid email address.");
  });

  it("explains required application company and invalid URLs", () => {
    const result = applicationSchema.safeParse({
      companyName: "",
      roleTitle: "Software Engineer Intern",
      applicationUrl: "not-a-url",
      jobPostingUrl: "also-not-a-url",
    });
    expect(result.success).toBe(false);
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.companyName).toContain("Company name is required.");
    expect(errors?.applicationUrl).toContain("Enter a valid application URL.");
    expect(errors?.jobPostingUrl).toContain("Enter a valid job posting URL.");
  });

  it("explains invalid contact email and document URL", () => {
    const contact = contactSchema.safeParse({
      name: "Recruiter",
      relationshipType: "RECRUITER",
      email: "bad-email",
    });
    expect(contact.success).toBe(false);
    expect(contact.error?.flatten().fieldErrors.email).toContain("Enter a valid email address.");

    const document = documentSchema.safeParse({
      name: "Resume",
      type: "RESUME",
      url: "bad-url",
    });
    expect(document.success).toBe(false);
    expect(document.error?.flatten().fieldErrors.url).toContain("Enter a valid document URL.");
  });

  it("returns row-level CSV import messages", () => {
    const result = validateApplicationsCsvRows(
      [{ companyName: "", roleTitle: "Engineer", applicationUrl: "bad-url" }],
      ["companyName", "roleTitle", "applicationUrl"],
    );
    expect(result.rowErrors).toContain("Row 2: Company name is required.");
    expect(result.rowErrors).toContain("Row 2: Application URL is not a valid URL.");
  });
});
