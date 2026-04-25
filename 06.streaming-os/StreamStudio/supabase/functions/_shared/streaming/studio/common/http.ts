import { toDomainError } from "./errors.ts";

export function requestId(req: Request): string {
  return req.headers.get("x-request-id") ?? crypto.randomUUID();
}

export async function readJson<T>(req: Request): Promise<T> {
  const text = await req.text();
  return text ? JSON.parse(text) as T : {} as T;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function ok(req: Request, data: unknown, status = 200): Response {
  return json({ ok: true, data, meta: { request_id: requestId(req) } }, status);
}

export function fail(req: Request, code: string, message: string, details?: unknown, status = 400): Response {
  return json({ ok: false, error: { code, message, details }, meta: { request_id: requestId(req) } }, status);
}

export function handleError(req: Request, error: unknown): Response {
  const e = toDomainError(error);
  return fail(req, e.code, e.message, e.details, e.status);
}
