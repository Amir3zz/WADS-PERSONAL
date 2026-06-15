import { NextResponse } from "next/server";

export type JsonBody = Record<string, unknown>;

export async function readJsonBody<T extends JsonBody = JsonBody>(
  req: Request
): Promise<T | null> {
  return req.json().catch(() => null);
}

export function text(value: unknown): string {
  return String(value ?? "").trim();
}

export function optionalText(value: unknown): string | null {
  const clean = text(value);
  return clean || null;
}

export function nonNegativeInteger(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;

  const parsed =
    typeof value === "number"
      ? value
      : Number(String(value).trim());

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function booleanValue(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function parseDateTime(value: unknown): Date | null {
  if (value === undefined || value === null) return null;

  const clean = String(value).trim();
  if (!clean) return null;

  const date = new Date(clean);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}