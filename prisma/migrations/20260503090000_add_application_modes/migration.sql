-- CreateEnum
CREATE TYPE "public"."ApplicationType" AS ENUM ('JOB', 'UNIVERSITY');

-- AlterEnum
ALTER TYPE "public"."ApplicationStatusType" ADD VALUE IF NOT EXISTS 'RESEARCHING';
ALTER TYPE "public"."ApplicationStatusType" ADD VALUE IF NOT EXISTS 'DOCUMENTS_PENDING';
ALTER TYPE "public"."ApplicationStatusType" ADD VALUE IF NOT EXISTS 'SUBMITTED';
ALTER TYPE "public"."ApplicationStatusType" ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';
ALTER TYPE "public"."ApplicationStatusType" ADD VALUE IF NOT EXISTS 'INTERVIEW';
ALTER TYPE "public"."ApplicationStatusType" ADD VALUE IF NOT EXISTS 'WAITLISTED';
ALTER TYPE "public"."ApplicationStatusType" ADD VALUE IF NOT EXISTS 'ACCEPTED';
ALTER TYPE "public"."ApplicationStatusType" ADD VALUE IF NOT EXISTS 'DEFERRED';

ALTER TYPE "public"."Source" ADD VALUE IF NOT EXISTS 'UNIVERSITY_WEBSITE';
ALTER TYPE "public"."Source" ADD VALUE IF NOT EXISTS 'COMMON_APP';
ALTER TYPE "public"."Source" ADD VALUE IF NOT EXISTS 'UCAS';
ALTER TYPE "public"."Source" ADD VALUE IF NOT EXISTS 'GRAD_PORTAL';
ALTER TYPE "public"."Source" ADD VALUE IF NOT EXISTS 'AGENT_CONSULTANT';
ALTER TYPE "public"."Source" ADD VALUE IF NOT EXISTS 'PROFESSOR';
ALTER TYPE "public"."Source" ADD VALUE IF NOT EXISTS 'ALUMNI';
ALTER TYPE "public"."Source" ADD VALUE IF NOT EXISTS 'EDUCATION_FAIR';

ALTER TYPE "public"."DocumentType" ADD VALUE IF NOT EXISTS 'CERTIFICATE';
ALTER TYPE "public"."DocumentType" ADD VALUE IF NOT EXISTS 'PERSONAL_STATEMENT';
ALTER TYPE "public"."DocumentType" ADD VALUE IF NOT EXISTS 'STATEMENT_OF_PURPOSE';
ALTER TYPE "public"."DocumentType" ADD VALUE IF NOT EXISTS 'RECOMMENDATION_LETTER';
ALTER TYPE "public"."DocumentType" ADD VALUE IF NOT EXISTS 'TEST_SCORE';
ALTER TYPE "public"."DocumentType" ADD VALUE IF NOT EXISTS 'RESEARCH_PROPOSAL';
ALTER TYPE "public"."DocumentType" ADD VALUE IF NOT EXISTS 'PASSPORT';
ALTER TYPE "public"."DocumentType" ADD VALUE IF NOT EXISTS 'FINANCIAL_DOCUMENT';
ALTER TYPE "public"."DocumentType" ADD VALUE IF NOT EXISTS 'SCHOLARSHIP_ESSAY';

ALTER TYPE "public"."RelationshipType" ADD VALUE IF NOT EXISTS 'ADMISSIONS_OFFICER';
ALTER TYPE "public"."RelationshipType" ADD VALUE IF NOT EXISTS 'PROFESSOR';
ALTER TYPE "public"."RelationshipType" ADD VALUE IF NOT EXISTS 'POTENTIAL_SUPERVISOR';
ALTER TYPE "public"."RelationshipType" ADD VALUE IF NOT EXISTS 'PROGRAM_COORDINATOR';
ALTER TYPE "public"."RelationshipType" ADD VALUE IF NOT EXISTS 'CURRENT_STUDENT';
ALTER TYPE "public"."RelationshipType" ADD VALUE IF NOT EXISTS 'RECOMMENDER';
ALTER TYPE "public"."RelationshipType" ADD VALUE IF NOT EXISTS 'AGENT_CONSULTANT';

ALTER TYPE "public"."ReminderType" ADD VALUE IF NOT EXISTS 'SCHOLARSHIP_DEADLINE';
ALTER TYPE "public"."ReminderType" ADD VALUE IF NOT EXISTS 'RECOMMENDATION_DEADLINE';
ALTER TYPE "public"."ReminderType" ADD VALUE IF NOT EXISTS 'DECISION_DATE';
ALTER TYPE "public"."ReminderType" ADD VALUE IF NOT EXISTS 'DEPOSIT_DEADLINE';

-- CreateEnum
CREATE TYPE "public"."DegreeLevel" AS ENUM ('UNDERGRADUATE', 'MASTERS', 'PHD', 'MBA', 'EXCHANGE', 'TRANSFER', 'CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."IntakeTerm" AS ENUM ('FALL', 'SPRING', 'SUMMER', 'WINTER', 'ROLLING', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN "applicationType" "public"."ApplicationType" NOT NULL DEFAULT 'JOB';
ALTER TABLE "public"."Task" ADD COLUMN "applicationType" "public"."ApplicationType" NOT NULL DEFAULT 'JOB';
ALTER TABLE "public"."Contact" ADD COLUMN "applicationType" "public"."ApplicationType" NOT NULL DEFAULT 'JOB';
ALTER TABLE "public"."Document" ADD COLUMN "applicationType" "public"."ApplicationType" NOT NULL DEFAULT 'JOB';
ALTER TABLE "public"."Reminder" ADD COLUMN "applicationType" "public"."ApplicationType" NOT NULL DEFAULT 'JOB';
ALTER TABLE "public"."UserSettings" ADD COLUMN "applicationMode" "public"."ApplicationType" NOT NULL DEFAULT 'JOB';

-- CreateTable
CREATE TABLE "public"."JobApplicationDetail" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "roleTitle" TEXT NOT NULL,
  "department" TEXT,
  "workMode" "public"."WorkMode" NOT NULL DEFAULT 'UNKNOWN',
  "season" "public"."InternshipSeason",
  "applicationYear" INTEGER,
  "compensation" TEXT,
  "visaSponsorship" BOOLEAN,
  "referralUsed" BOOLEAN NOT NULL DEFAULT false,
  "jobPostingUrl" TEXT,
  "applicationUrl" TEXT,
  "jobDescription" TEXT,
  CONSTRAINT "JobApplicationDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UniversityApplicationDetail" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "institutionName" TEXT NOT NULL,
  "programName" TEXT NOT NULL,
  "degreeLevel" "public"."DegreeLevel",
  "facultyOrDepartment" TEXT,
  "applicationRound" TEXT,
  "intakeTerm" "public"."IntakeTerm",
  "intakeYear" INTEGER,
  "campus" TEXT,
  "programUrl" TEXT,
  "applicationPortalUrl" TEXT,
  "tuitionEstimate" TEXT,
  "scholarshipApplied" BOOLEAN NOT NULL DEFAULT false,
  "fundingStatus" TEXT,
  "testRequirementStatus" TEXT,
  "recommendationRequirementStatus" TEXT,
  "statementPrompt" TEXT,
  CONSTRAINT "UniversityApplicationDetail_pkey" PRIMARY KEY ("id")
);

-- Backfill
INSERT INTO "public"."JobApplicationDetail" (
  "id",
  "applicationId",
  "companyName",
  "roleTitle",
  "department",
  "workMode",
  "season",
  "applicationYear",
  "compensation",
  "visaSponsorship",
  "referralUsed",
  "jobPostingUrl",
  "applicationUrl",
  "jobDescription"
)
SELECT
  concat('jad_', md5(random()::text || clock_timestamp()::text || "id")),
  "id",
  "companyName",
  "roleTitle",
  "department",
  "workMode",
  "season",
  "applicationYear",
  "compensation",
  "visaSponsorship",
  "referralUsed",
  "jobPostingUrl",
  "applicationUrl",
  "jobDescription"
FROM "public"."Application"
WHERE "applicationType" = 'JOB';

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationDetail_applicationId_key" ON "public"."JobApplicationDetail"("applicationId");
CREATE UNIQUE INDEX "UniversityApplicationDetail_applicationId_key" ON "public"."UniversityApplicationDetail"("applicationId");
CREATE INDEX "Application_userId_applicationType_idx" ON "public"."Application"("userId", "applicationType");
CREATE INDEX "Application_userId_applicationType_archived_idx" ON "public"."Application"("userId", "applicationType", "archived");
CREATE INDEX "Application_userId_applicationType_status_idx" ON "public"."Application"("userId", "applicationType", "status");
CREATE INDEX "Application_userId_applicationType_deadline_idx" ON "public"."Application"("userId", "applicationType", "deadline");
CREATE INDEX "Application_userId_applicationType_deletedAt_idx" ON "public"."Application"("userId", "applicationType", "deletedAt");
CREATE INDEX "Task_userId_applicationType_idx" ON "public"."Task"("userId", "applicationType");
CREATE INDEX "Task_userId_applicationType_completed_idx" ON "public"."Task"("userId", "applicationType", "completed");
CREATE INDEX "Task_userId_applicationType_dueDate_idx" ON "public"."Task"("userId", "applicationType", "dueDate");
CREATE INDEX "Contact_userId_applicationType_idx" ON "public"."Contact"("userId", "applicationType");
CREATE INDEX "Contact_userId_applicationType_followUpDate_idx" ON "public"."Contact"("userId", "applicationType", "followUpDate");
CREATE INDEX "Document_userId_applicationType_idx" ON "public"."Document"("userId", "applicationType");
CREATE INDEX "Document_userId_applicationType_type_idx" ON "public"."Document"("userId", "applicationType", "type");
CREATE INDEX "Document_userId_applicationType_updatedAt_idx" ON "public"."Document"("userId", "applicationType", "updatedAt");
CREATE INDEX "Reminder_userId_applicationType_idx" ON "public"."Reminder"("userId", "applicationType");
CREATE INDEX "Reminder_userId_applicationType_remindAt_idx" ON "public"."Reminder"("userId", "applicationType", "remindAt");
CREATE INDEX "Reminder_userId_applicationType_completed_idx" ON "public"."Reminder"("userId", "applicationType", "completed");

-- AddForeignKey
ALTER TABLE "public"."JobApplicationDetail" ADD CONSTRAINT "JobApplicationDetail_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."UniversityApplicationDetail" ADD CONSTRAINT "UniversityApplicationDetail_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
