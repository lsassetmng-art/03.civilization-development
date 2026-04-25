import { assert } from "./errors.ts";

export function requiredString(value: unknown, field: string): string {
  assert(typeof value === "string" && value.trim().length > 0, "INVALID_INPUT", `${field} is required`);
  return value.trim();
}

export function optionalString(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  assert(typeof value === "string", "INVALID_INPUT", "Optional string field must be a string");
  return value.trim();
}

export function requiredInteger(value: unknown, field: string): number {
  assert(typeof value === "number" && Number.isInteger(value), "INVALID_INPUT", `${field} must be an integer`);
  return value;
}

export function optionalInteger(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  assert(typeof value === "number" && Number.isInteger(value), "INVALID_INPUT", "Optional integer field must be an integer");
  return value;
}

export function requiredUuid(value: unknown, field: string): string {
  return requiredString(value, field);
}

export function clampLimit(value: unknown, fallback = 20): number {
  if (value === undefined || value === null || value === "") return fallback;
  assert(typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 100, "INVALID_INPUT", "limit must be 1..100");
  return value;
}
