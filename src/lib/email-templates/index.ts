export type TemplateType =
  | "recruiter-follow-up"
  | "thank-you"
  | "referral-request"
  | "networking-message"
  | "application-status-inquiry"
  | "coffee-chat"
  | "interview-availability"
  | "offer-negotiation"
  | "offer-acceptance"
  | "offer-rejection"
  | "application-withdrawal"
  | "admissions-inquiry"
  | "professor-outreach"
  | "recommendation-request"
  | "admissions-thank-you"
  | "scholarship-inquiry"
  | "deferral-request"
  | "university-offer-acceptance"
  | "university-offer-decline"
  | "waitlist-interest";

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
  const roleTitle = sanitize(vars.roleTitle) || "the role";
  const institutionName = companyName === "your company" ? "your institution" : companyName;
  const programName = roleTitle === "the role" ? "the program" : roleTitle;
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
      return `Hi ${contactName},\n\nI came across your profile while researching opportunities at ${companyName}. I'm currently pursuing job opportunities such as ${roleTitle}, and I'd love to connect.\n\n${customNotes}\n\nBest,\n${userName}`;
    case "application-status-inquiry":
      return `Subject: Application Status Inquiry - ${programName}\n\nDear ${contactName},\n\nI hope you're doing well. I wanted to ask whether there are any updates on my application to ${programName} at ${institutionName}.\n\n${customNotes}\n\nSincerely,\n${userName}`;
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
    case "admissions-inquiry":
      return `Subject: Inquiry About ${programName}\n\nDear ${contactName},\n\nI hope you're doing well. I am interested in ${programName} at ${institutionName} and would appreciate any guidance on admissions requirements, deadlines, or next steps.\n\n${customNotes}\n\nSincerely,\n${userName}`;
    case "professor-outreach":
      return `Subject: Prospective Student Interested in ${programName}\n\nDear ${contactName},\n\nI am a prospective applicant to ${programName} at ${institutionName}. I am interested in your work and would be grateful for the chance to ask whether my academic interests may align with the program.\n\n${customNotes}\n\nSincerely,\n${userName}`;
    case "recommendation-request":
      return `Subject: Recommendation Letter Request\n\nDear ${contactName},\n\nI hope you're doing well. I am applying to ${programName} at ${institutionName} and wanted to ask if you would be comfortable writing a recommendation letter for me.\n\n${customNotes}\n\nThank you,\n${userName}`;
    case "admissions-thank-you":
      return `Subject: Thank You - ${programName} Interview\n\nDear ${contactName},\n\nThank you for speaking with me${interviewDate ? ` on ${interviewDate}` : ""} about ${programName} at ${institutionName}. I appreciated learning more about ${specificTopic || "the program"}.\n\n${customNotes}\n\nSincerely,\n${userName}`;
    case "scholarship-inquiry":
      return `Subject: Scholarship Inquiry - ${programName}\n\nDear ${contactName},\n\nI am applying to ${programName} at ${institutionName} and would like to ask about scholarship or funding opportunities available to applicants.\n\n${customNotes}\n\nSincerely,\n${userName}`;
    case "deferral-request":
      return `Subject: Deferral Request - ${programName}\n\nDear ${contactName},\n\nI am writing to ask about the possibility of deferring my admission to ${programName} at ${institutionName}. I would appreciate guidance on the process and required documentation.\n\n${customNotes}\n\nSincerely,\n${userName}`;
    case "university-offer-acceptance":
      return `Subject: Acceptance of Admission Offer - ${programName}\n\nDear ${contactName},\n\nI am delighted to accept my offer of admission to ${programName} at ${institutionName}. Thank you for this opportunity.\n\n${customNotes}\n\nSincerely,\n${userName}`;
    case "university-offer-decline":
      return `Subject: Admission Offer Decision - ${programName}\n\nDear ${contactName},\n\nThank you for offering me admission to ${programName} at ${institutionName}. After careful consideration, I have decided to decline the offer.\n\nI appreciate your time and consideration.\n\nSincerely,\n${userName}`;
    case "waitlist-interest":
      return `Subject: Continued Interest in ${programName}\n\nDear ${contactName},\n\nI am writing to reaffirm my strong interest in ${programName} at ${institutionName}. I would be grateful to remain under consideration from the waitlist.\n\n${customNotes}\n\nSincerely,\n${userName}`;
    default:
      return "";
  }
}
