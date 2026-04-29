import { NextResponse } from "next/server";
import { appError, toActionError } from "@/lib/errors";

export async function parseJsonBody<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw appError("VALIDATION_ERROR", "Request body must be valid JSON.");
  }
}

export function apiError(error: unknown, status = 400) {
  const result = toActionError(error, "Something went wrong. Please try again.");
  const responseStatus = !result.ok && result.code === "UNAUTHORIZED" ? 401 : !result.ok && result.code === "NOT_FOUND" ? 404 : status;
  return NextResponse.json(result, { status: responseStatus });
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { ok: false, code: "UNAUTHORIZED", message: "Please sign in to continue." },
    { status: 401 },
  );
}
