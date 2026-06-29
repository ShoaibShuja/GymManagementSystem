import { isValid, parseISO } from "date-fns";
import { z } from "zod";

const phonePattern = /^[+()\-\s\d]{3,30}$/;

export function requiredText(label: string, minLength = 2) {
  return z
    .string()
    .trim()
    .min(minLength, `${label} is required.`)
    .max(120, `${label} is too long.`);
}

export function optionalText(maxLength = 500) {
  return z
    .string()
    .trim()
    .max(maxLength, `Keep this under ${maxLength} characters.`)
    .optional();
}

export const phoneSchema = z
  .string()
  .trim()
  .min(3, "Phone number is required.")
  .max(30, "Phone number is too long.")
  .regex(phonePattern, "Enter a valid phone number.");

export const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, "Phone number is too long.")
  .refine((value) => !value || phonePattern.test(value), {
    message: "Enter a valid phone number.",
  })
  .optional();

export function dateStringSchema(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => isValid(parseISO(value)), {
      message: `Enter a valid ${label.toLowerCase()}.`,
    });
}

export function databaseIdSchema(message: string) {
  return z.string().trim().min(1, message);
}

export function positiveIntegerSchema(label: string) {
  return z
    .number({ error: `${label} is required.` })
    .finite(`${label} must be a valid number.`)
    .int(`${label} must be a whole number.`)
    .min(1, `${label} must be at least 1.`);
}

export function moneySchema(label: string) {
  return z
    .number({ error: `${label} is required.` })
    .finite(`${label} must be a valid amount.`)
    .min(0, `${label} cannot be negative.`);
}
