export interface CalendarService {
  createEvent(input: { title: string; startsAt: Date; endsAt?: Date; description?: string }): Promise<string>;
  updateEvent(eventId: string, input: { title?: string; startsAt?: Date; endsAt?: Date; description?: string }): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
  exportICS(events: { title: string; startsAt: Date; endsAt?: Date; description?: string }[]): Promise<string>;
}

export interface EmailService {
  sendFollowUp(input: { to: string; subject: string; body: string }): Promise<void>;
  draftThankYouEmail(input: { to: string; roleTitle: string; companyName: string; body: string }): Promise<string>;
  sendReminder(input: { to: string; title: string; body: string }): Promise<void>;
}

export class LocalCalendarService implements CalendarService {
  async createEvent() {
    return `local-${crypto.randomUUID()}`;
  }

  async updateEvent() {}

  async deleteEvent() {}

  async exportICS(events: { title: string; startsAt: Date; endsAt?: Date; description?: string }[]) {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Internship Tracker//EN"];
    for (const event of events) {
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${crypto.randomUUID()}`);
      lines.push(`SUMMARY:${event.title}`);
      lines.push(`DTSTART:${event.startsAt.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`);
      if (event.endsAt) {
        lines.push(`DTEND:${event.endsAt.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`);
      }
      if (event.description) lines.push(`DESCRIPTION:${event.description}`);
      lines.push("END:VEVENT");
    }
    lines.push("END:VCALENDAR");
    return lines.join("\n");
  }
}

export class LocalEmailService implements EmailService {
  async sendFollowUp() {}

  async draftThankYouEmail(input: { to: string; roleTitle: string; companyName: string; body: string }) {
    return `To: ${input.to}\nSubject: Thank you - ${input.roleTitle}\n\n${input.body}`;
  }

  async sendReminder() {}
}
