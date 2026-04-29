import { z } from "zod";

export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "REQUIRED_FIELD"
  | "INVALID_EMAIL"
  | "INVALID_PASSWORD"
  | "PASSWORD_TOO_SHORT"
  | "PASSWORD_TOO_WEAK"
  | "EMAIL_ALREADY_EXISTS"
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "DUPLICATE_APPLICATION"
  | "INVALID_URL"
  | "INVALID_DATE"
  | "PAST_DEADLINE"
  | "CSV_PARSE_ERROR"
  | "CSV_VALIDATION_ERROR"
  | "LINK_FAILED"
  | "DELETE_FAILED"
  | "NETWORK_ERROR"
  | "RATE_LIMITED"
  | "UNKNOWN_ERROR";

export type FieldErrors = Record<string, string[]>;

export type ActionResult<T = unknown> =
  | {
      ok: true;
      data?: T;
      message?: string;
    }
  | {
      ok: false;
      code: AppErrorCode;
      message: string;
      fieldErrors?: FieldErrors;
    };

export class AppError extends Error {
  code: AppErrorCode;
  userMessage: string;
  fieldErrors?: FieldErrors;
  status: number;

  constructor(code: AppErrorCode, userMessage: string, options: { fieldErrors?: FieldErrors; status?: number } = {}) {
    super(userMessage);
    this.name = "AppError";
    this.code = code;
    this.userMessage = userMessage;
    this.fieldErrors = options.fieldErrors;
    this.status = options.status ?? 400;
  }
}

export function ok<T>(data?: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function userError(
  code: AppErrorCode,
  message: string,
  fieldErrors?: FieldErrors,
): ActionResult<never> {
  return {
    ok: false,
    code,
    message,
    fieldErrors,
  };
}

export function appError(
  code: AppErrorCode,
  message: string,
  options?: { fieldErrors?: FieldErrors; status?: number },
) {
  return new AppError(code, message, options);
}

export function unknownUserError(message = "Something went wrong. Please try again."): ActionResult<never> {
  return {
    ok: false,
    code: "UNKNOWN_ERROR",
    message,
  };
}

export function isActionResult<T = unknown>(value: unknown): value is ActionResult<T> {
  return Boolean(value && typeof value === "object" && "ok" in value);
}

export function getActionErrorMessage(result: ActionResult<unknown>) {
  return result.ok ? undefined : result.message;
}

export function logInternalError(error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }
}

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  return error.flatten().fieldErrors;
}

export function validationUserError(error: z.ZodError, message = "Please fix the highlighted fields.") {
  return userError("VALIDATION_ERROR", message, zodFieldErrors(error));
}

export function getUserFacingError(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof AppError) return error.userMessage;
  if (error instanceof z.ZodError) return "Please fix the highlighted fields.";
  return fallback;
}

export function toActionError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
  fallbackCode: AppErrorCode = "UNKNOWN_ERROR",
): ActionResult<never> {
  if (error instanceof AppError) {
    return userError(error.code, error.userMessage, error.fieldErrors);
  }

  if (error instanceof z.ZodError) {
    return validationUserError(error);
  }

  const prismaCode =
    error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : undefined;
  if (prismaCode) {
    if (prismaCode === "P2002") {
      return userError("VALIDATION_ERROR", "This item already exists.");
    }
    if (prismaCode === "P2025") {
      return userError("NOT_FOUND", "This item no longer exists.");
    }
    if (prismaCode === "P2003") {
      return userError("LINK_FAILED", "The related item could not be found. Refresh the page and try again.");
    }
  }

  if (error instanceof Error && error.message === "Unauthorized") {
    return userError("UNAUTHORIZED", "Please sign in to continue.");
  }

  logInternalError(error);
  return userError(fallbackCode, fallback);
}
