-- Add composite indexes used by the application detail workspace.
CREATE INDEX "Interview_userId_applicationId_scheduledAt_idx" ON "Interview"("userId", "applicationId", "scheduledAt");
CREATE INDEX "Task_userId_applicationId_dueDate_idx" ON "Task"("userId", "applicationId", "dueDate");
CREATE INDEX "Task_userId_applicationId_completed_idx" ON "Task"("userId", "applicationId", "completed");
CREATE INDEX "Contact_userId_company_idx" ON "Contact"("userId", "company");
CREATE INDEX "Document_userId_type_idx" ON "Document"("userId", "type");
CREATE INDEX "TimelineEvent_userId_applicationId_occurredAt_idx" ON "TimelineEvent"("userId", "applicationId", "occurredAt");
CREATE INDEX "ActivityLog_userId_applicationId_createdAt_idx" ON "ActivityLog"("userId", "applicationId", "createdAt");
