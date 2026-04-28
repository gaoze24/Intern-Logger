import { db } from "@/lib/db";
import { DEFAULT_STATUSES } from "@/constants/app";

export async function createDefaultStatusesIfNeeded(userId: string) {
  const existingCount = await db.applicationStatus.count({ where: { userId } });
  if (existingCount > 0) return;

  await db.applicationStatus.createMany({
    data: DEFAULT_STATUSES.map((status) => ({
      userId,
      name: status.name,
      color: status.color,
      order: status.order,
      isFinal: status.isFinal,
    })),
  });
}
