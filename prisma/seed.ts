import bcrypt from "bcryptjs";
import {
  ApplicationStatusType,
  DocumentType,
  InterviewOutcome,
  InterviewType,
  InternshipSeason,
  Priority,
  RelationshipType,
  Source,
  TaskPriority,
  WorkMode,
  PrismaClient,
} from "@prisma/client";
import { DEFAULT_STATUSES } from "../src/constants/app";

const prisma = new PrismaClient();

const companies = [
  "Google",
  "Meta",
  "Jane Street",
  "Citadel",
  "UBS",
  "Goldman Sachs",
  "ByteDance",
  "Shopee",
  "Grab",
  "Stripe",
  "Canva",
  "Microsoft",
  "Amazon",
  "Bloomberg",
];

const roles = [
  "Software Engineer Intern",
  "Quantitative Research Intern",
  "Data Analyst Intern",
  "Machine Learning Intern",
  "Product Manager Intern",
  "Business Analyst Intern",
  "Cybersecurity Intern",
  "Backend Engineer Intern",
];

const statuses: ApplicationStatusType[] = [
  "WISHLIST",
  "PREPARING",
  "APPLIED",
  "ONLINE_ASSESSMENT",
  "RECRUITER_SCREEN",
  "TECHNICAL_INTERVIEW",
  "BEHAVIORAL_INTERVIEW",
  "FINAL_ROUND",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

async function main() {
  const email = "demo@interntracker.dev";
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: "Demo Student", passwordHash },
    create: { email, name: "Demo Student", passwordHash },
  });

  const existingStatuses = await prisma.applicationStatus.count({ where: { userId: user.id } });
  if (!existingStatuses) {
    await prisma.applicationStatus.createMany({
      data: DEFAULT_STATUSES.map((status) => ({ ...status, userId: user.id })),
    });
  }

  const createdApps = [];
  for (let i = 0; i < 14; i++) {
    const app = await prisma.application.create({
      data: {
        userId: user.id,
        companyName: companies[i % companies.length],
        roleTitle: roles[i % roles.length],
        location: i % 2 ? "Singapore" : "Remote",
        country: i % 2 ? "Singapore" : "United States",
        workMode: i % 3 === 0 ? WorkMode.REMOTE : i % 3 === 1 ? WorkMode.HYBRID : WorkMode.ONSITE,
        status: statuses[i % statuses.length],
        priority: i % 4 === 0 ? Priority.DREAM : i % 3 === 0 ? Priority.HIGH : Priority.MEDIUM,
        source: i % 2 ? Source.LINKEDIN : Source.COMPANY_WEBSITE,
        applicationUrl: `https://jobs.example.com/${i}`,
        jobPostingUrl: `https://company.example.com/posting/${i}`,
        deadline: new Date(Date.now() + (i - 4) * 86400000 * 3),
        appliedDate: new Date(Date.now() - i * 86400000 * 2),
        discoveredDate: new Date(Date.now() - i * 86400000 * 3),
        season: InternshipSeason.SUMMER,
        applicationYear: 2027,
        compensation: i % 2 ? "$7,000/mo" : "Competitive",
        visaSponsorship: i % 2 === 0,
        referralUsed: i % 5 === 0,
        jobDescription: "Build scalable systems using TypeScript, React, and distributed systems concepts.",
        notes: "Prepare strong behavioral stories and system design basics.",
        archived: i === 13,
      },
    });
    createdApps.push(app);
  }

  for (const app of createdApps.slice(0, 10)) {
    await prisma.interview.create({
      data: {
        userId: user.id,
        applicationId: app.id,
        title: "Technical Round",
        type: InterviewType.TECHNICAL_INTERVIEW,
        scheduledAt: new Date(Date.now() + 86400000 * 5),
        interviewerName: "Alex Recruiter",
        outcome: InterviewOutcome.PENDING,
      },
    });

    await prisma.task.create({
      data: {
        userId: user.id,
        applicationId: app.id,
        title: "Prepare interview notes",
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 86400000 * 2),
      },
    });

    await prisma.timelineEvent.create({
      data: {
        userId: user.id,
        applicationId: app.id,
        type: "APPLIED",
        title: "Application submitted",
        occurredAt: app.appliedDate ?? new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        applicationId: app.id,
        entityType: "APPLICATION",
        entityId: app.id,
        action: "seeded",
      },
    });
  }

  const contact = await prisma.contact.create({
    data: {
      userId: user.id,
      name: "Jordan Lee",
      company: "Google",
      role: "Campus Recruiter",
      email: "jordan.lee@example.com",
      relationshipType: RelationshipType.RECRUITER,
      source: Source.RECRUITER,
      followUpDate: new Date(Date.now() + 86400000 * 4),
    },
  });

  const document = await prisma.document.create({
    data: {
      userId: user.id,
      name: "Resume v3 SWE",
      type: DocumentType.RESUME,
      url: "https://docs.example.com/resume-v3",
      version: "v3",
      notes: "Optimized for backend internships",
      tags: ["typescript", "backend", "distributed-systems"],
    },
  });

  await prisma.applicationContact.create({
    data: {
      applicationId: createdApps[0].id,
      contactId: contact.id,
      relationshipToApplication: "Recruiter",
    },
  });

  await prisma.applicationDocument.create({
    data: {
      applicationId: createdApps[0].id,
      documentId: document.id,
      usageType: "Resume Used",
    },
  });

  await prisma.reminder.createMany({
    data: createdApps.slice(0, 6).map((app, idx) => ({
      userId: user.id,
      applicationId: app.id,
      title: `Follow up with ${app.companyName}`,
      remindAt: new Date(Date.now() + (idx + 1) * 86400000),
      type: "FOLLOW_UP",
      completed: false,
    })),
  });

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {
      university: "National University of Singapore",
      major: "Computer Science",
      graduationYear: 2027,
      targetRoles: ["Software Engineer Intern", "ML Intern"],
      targetLocations: ["Singapore", "United States"],
    },
    create: {
      userId: user.id,
      university: "National University of Singapore",
      major: "Computer Science",
      graduationYear: 2027,
      targetRoles: ["Software Engineer Intern", "ML Intern"],
      targetLocations: ["Singapore", "United States"],
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
