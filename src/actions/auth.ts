"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signUpSchema } from "@/lib/validations/auth";
import { createDefaultStatusesIfNeeded } from "@/lib/services/bootstrap";

export async function signUpAction(input: unknown) {
  const parsed = signUpSchema.parse(input);
  const existing = await db.user.findUnique({ where: { email: parsed.email } });
  if (existing) {
    throw new Error("Email already in use");
  }
  const passwordHash = await bcrypt.hash(parsed.password, 12);
  const user = await db.user.create({
    data: {
      email: parsed.email,
      name: parsed.name,
      passwordHash,
    },
  });
  await createDefaultStatusesIfNeeded(user.id);
  return { id: user.id, email: user.email };
}
