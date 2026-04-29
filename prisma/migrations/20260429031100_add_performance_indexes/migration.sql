-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "public"."Application"("userId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "public"."Application"("status");

-- CreateIndex
CREATE INDEX "Application_priority_idx" ON "public"."Application"("priority");

-- CreateIndex
CREATE INDEX "Application_deadline_idx" ON "public"."Application"("deadline");

-- CreateIndex
CREATE INDEX "Application_appliedDate_idx" ON "public"."Application"("appliedDate");

-- CreateIndex
CREATE INDEX "Application_archived_idx" ON "public"."Application"("archived");

-- CreateIndex
CREATE INDEX "Application_userId_status_idx" ON "public"."Application"("userId", "status");

-- CreateIndex
CREATE INDEX "Application_userId_archived_idx" ON "public"."Application"("userId", "archived");

-- CreateIndex
CREATE INDEX "Application_userId_companyName_idx" ON "public"."Application"("userId", "companyName");

-- CreateIndex
CREATE INDEX "Application_userId_roleTitle_idx" ON "public"."Application"("userId", "roleTitle");

-- CreateIndex
CREATE INDEX "Application_userId_updatedAt_idx" ON "public"."Application"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Interview_userId_idx" ON "public"."Interview"("userId");

-- CreateIndex
CREATE INDEX "Interview_applicationId_idx" ON "public"."Interview"("applicationId");

-- CreateIndex
CREATE INDEX "Interview_scheduledAt_idx" ON "public"."Interview"("scheduledAt");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "public"."Task"("userId");

-- CreateIndex
CREATE INDEX "Task_applicationId_idx" ON "public"."Task"("applicationId");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "public"."Task"("dueDate");

-- CreateIndex
CREATE INDEX "Task_completed_idx" ON "public"."Task"("completed");

-- CreateIndex
CREATE INDEX "Task_userId_dueDate_idx" ON "public"."Task"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "Task_userId_completed_idx" ON "public"."Task"("userId", "completed");

-- CreateIndex
CREATE INDEX "Contact_userId_idx" ON "public"."Contact"("userId");

-- CreateIndex
CREATE INDEX "Contact_company_idx" ON "public"."Contact"("company");

-- CreateIndex
CREATE INDEX "Contact_followUpDate_idx" ON "public"."Contact"("followUpDate");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "public"."Document"("userId");

-- CreateIndex
CREATE INDEX "Document_updatedAt_idx" ON "public"."Document"("updatedAt");

-- CreateIndex
CREATE INDEX "Document_userId_updatedAt_idx" ON "public"."Document"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Reminder_userId_idx" ON "public"."Reminder"("userId");

-- CreateIndex
CREATE INDEX "Reminder_remindAt_idx" ON "public"."Reminder"("remindAt");

-- CreateIndex
CREATE INDEX "Reminder_completed_idx" ON "public"."Reminder"("completed");

-- CreateIndex
CREATE INDEX "Reminder_userId_remindAt_idx" ON "public"."Reminder"("userId", "remindAt");

-- CreateIndex
CREATE INDEX "Reminder_userId_completed_idx" ON "public"."Reminder"("userId", "completed");
