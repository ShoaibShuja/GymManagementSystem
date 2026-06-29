import { z } from "zod";

type DatabaseError = {
  code?: string;
  message?: string;
};

export function getActionErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function getDatabaseErrorMessage(
  error: DatabaseError | null | undefined,
  fallback = "The record could not be saved. Please check the details and try again.",
) {
  if (!error) {
    return fallback;
  }

  const message = error.message?.toLowerCase() ?? "";

  if (error.code === "23505" || message.includes("duplicate")) {
    return "A record with these details already exists.";
  }

  if (error.code === "23503" || message.includes("foreign key")) {
    return "One of the selected records is no longer available. Refresh the page and try again.";
  }

  if (error.code === "23514" || message.includes("check constraint")) {
    return "Some details are invalid. Review the form and try again.";
  }

  if (error.code === "42501" || message.includes("row-level security")) {
    return "You do not have permission to make this change.";
  }

  if (message.includes("jwt") || message.includes("auth")) {
    return "Your session has expired. Sign in again to continue.";
  }

  return fallback;
}

export function getQueryErrorMessage(
  error: Error | null | undefined,
  fallback = "Could not load this information. Refresh the page and try again.",
) {
  if (!error) {
    return fallback;
  }

  const message = error.message.toLowerCase();

  if (
    message.includes("permission") ||
    message.includes("row-level security")
  ) {
    return "You do not have permission to view this information.";
  }

  if (message.includes("failed to fetch") || message.includes("network")) {
    return "Could not connect to the database. Check the internet connection and try again.";
  }

  return fallback;
}
