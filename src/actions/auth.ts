"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signUpSchema } from "@/lib/validations/auth";
import { createDefaultStatusesIfNeeded } from "@/lib/services/bootstrap";
import { ok, toActionError, userError, validationUserError } from "@/lib/errors";

export async function signUpAction(input: unknown) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return validationUserError(parsed.error);

  try {
    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return userError("EMAIL_ALREADY_EXISTS", "An account with this email already exists. Try signing in instead.", {
        email: ["An account with this email already exists. Try signing in instead."],
      });
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await db.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
      },
    });
    await createDefaultStatusesIfNeeded(user.id);
    return ok({ id: user.id, email: user.email }, "Account created.");
  } catch (error) {
    return toActionError(error, "Could not create your account. Please try again.");
  }
}
