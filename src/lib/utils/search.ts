import type { ApplicationWithRelations } from "@/types";

export function normalizeTerm(value: string) {
  return value.trim().toLowerCase();
}

export function matchesSearch(application: ApplicationWithRelations, term: string) {
  if (!term) return true;
  const q = normalizeTerm(term);
  const haystack = [
    application.companyName,
    application.roleTitle,
    application.department,
    application.location,
    application.country,
    application.notes,
    application.jobDescription,
    application.applicationUrl,
    application.jobPostingUrl,
    ...application.tags.map((t) => t.tag.name),
    ...application.contacts.flatMap((c) => [c.contact.name, c.contact.email, c.contact.role, c.contact.notes]),
    ...application.interviews.flatMap((i) => [i.title, i.preparationNotes, i.questionsAsked, i.reflection]),
    ...application.tasks.flatMap((t) => [t.title, t.description]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}
