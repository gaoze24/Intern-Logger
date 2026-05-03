import { ApplicationType, type UserSettings } from "@prisma/client";
import { db } from "@/lib/db";
import { appError } from "@/lib/errors";

export async function getUserSettings(userId: string): Promise<UserSettings> {
  return db.userSettings.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      targetRoles: [],
      targetLocations: [],
      customTags: [],
      customRoleTypes: [],
      customSources: [],
      applicationMode: ApplicationType.JOB,
    },
  });
}

export async function getCurrentApplicationMode(userId: string) {
  const settings = await getUserSettings(userId);
  return settings.applicationMode;
}

export async function updateApplicationMode(userId: string, mode: unknown) {
  if (mode !== ApplicationType.JOB && mode !== ApplicationType.UNIVERSITY) {
    throw appError("VALIDATION_ERROR", "Choose either Job Applications or University Applications.", {
      fieldErrors: { applicationMode: ["Choose either Job Applications or University Applications."] },
    });
  }

  return db.userSettings.upsert({
    where: { userId },
    update: { applicationMode: mode },
    create: {
      userId,
      targetRoles: [],
      targetLocations: [],
      customTags: [],
      customRoleTypes: [],
      customSources: [],
      applicationMode: mode,
    },
  });
}
