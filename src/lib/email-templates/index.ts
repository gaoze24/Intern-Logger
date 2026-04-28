export type TemplateType =
  | "recruiter-follow-up"
  | "thank-you"
  | "referral-request"
  | "networking-message"
  | "coffee-chat"
  | "interview-availability"
  | "offer-negotiation"
  | "offer-acceptance"
  | "offer-rejection"
  | "application-withdrawal";

export type TemplateVariables = {
  contactName?: string;
  companyName?: string;
  roleTitle?: string;
  interviewDate?: string;
  userName?: string;
  customNotes?: string;
  specificTopicDiscussed?: string;
};

const sanitize = (value?: string) => value?.trim() || "";

export function generateEmailTemplate(type: TemplateType, vars: TemplateVariables) {
  const contactName = sanitize(vars.contactName) || "Hiring Team";
  const companyName = sanitize(vars.companyName) || "your company";
  const roleTitle = sanitize(vars.roleTitle) || "the internship role";
  const userName = sanitize(vars.userName) || "Your Name";
  const interviewDate = sanitize(vars.interviewDate);
  const customNotes = sanitize(vars.customNotes);
  const specificTopic = sanitize(vars.specificTopicDiscussed);

  switch (type) {
    case "recruiter-follow-up":
      return `Subject: Follow-up on ${roleTitle} Application\n\nHi ${contactName},\n\nI hope you're doing well. I wanted to follow up on my application for ${roleTitle} at ${companyName}. I'm very excited about the opportunity and would love to know if there are any updates on next steps.\n\n${customNotes}\n\nBest,\n${userName}`;
    case "thank-you":
      return `Subject: Thank you - ${roleTitle} Interview\n\nHi ${contactName},\n\nThank you for taking the time to speak with me${interviewDate ? ` on ${interviewDate}` : ""} about the ${roleTitle} opportunity at ${companyName}. I especially enjoyed discussing ${specificTopic || "the role and team"}.\n\n${customNotes}\n\nBest regards,\n${userName}`;
    case "referral-request":
      return `Subject: Referral Request - ${roleTitle}\n\nHi ${contactName},\n\nI hope you're doing well. I'm planning to apply for the ${roleTitle} role at ${companyName} and wanted to ask if you'd be open to referring me.\n\n${customNotes}\n\nThank you,\n${userName}`;
    case "networking-message":
      return `Hi ${contactName},\n\nI came across your profile while researching opportunities at ${companyName}. I'm currently pursuing internship roles such as ${roleTitle}, and I'd love to connect.\n\n${customNotes}\n\nBest,\n${userName}`;
    case "coffee-chat":
      return `Subject: Coffee Chat Request\n\nHi ${contactName},\n\nI admire your work at ${companyName} and would really appreciate the chance to learn from your experience. If you're open, I'd love to schedule a short coffee chat.\n\n${customNotes}\n\nThanks,\n${userName}`;
    case "interview-availability":
      return `Subject: Interview Availability - ${roleTitle}\n\nHi ${contactName},\n\nThank you for the invitation. I'm excited to proceed for the ${roleTitle} role at ${companyName}. I'm available at the suggested times and happy to confirm whichever slot works best.\n\n${customNotes}\n\nBest,\n${userName}`;
    case "offer-negotiation":
      return `Subject: ${roleTitle} Offer Discussion\n\nHi ${contactName},\n\nThank you for extending the offer for ${roleTitle} at ${companyName}. I'm excited about the opportunity and wanted to discuss the compensation package.\n\n${customNotes}\n\nSincerely,\n${userName}`;
    case "offer-acceptance":
      return `Subject: Offer Acceptance - ${roleTitle}\n\nHi ${contactName},\n\nI'm delighted to accept the offer for ${roleTitle} at ${companyName}. Thank you for this opportunity.\n\n${customNotes}\n\nBest,\n${userName}`;
    case "offer-rejection":
      return `Subject: Offer Decision - ${roleTitle}\n\nHi ${contactName},\n\nThank you for the offer for ${roleTitle} at ${companyName}. After careful consideration, I have decided to decline.\n\nI truly appreciate your time throughout the process.\n\nBest regards,\n${userName}`;
    case "application-withdrawal":
      return `Subject: Withdrawal of Application - ${roleTitle}\n\nHi ${contactName},\n\nI hope you're well. I would like to withdraw my application for ${roleTitle} at ${companyName}. Thank you for your consideration.\n\n${customNotes}\n\nBest,\n${userName}`;
    default:
      return "";
  }
}
