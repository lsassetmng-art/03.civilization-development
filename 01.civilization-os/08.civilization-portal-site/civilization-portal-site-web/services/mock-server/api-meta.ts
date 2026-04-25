import type { PortalApiMeta } from "../../types/portal-api";

const nowIso = (): string => new Date().toISOString();

export const createPortalApiMeta = (success: boolean): PortalApiMeta => ({
  success,
  requestId: crypto.randomUUID(),
  timestamp: nowIso(),
});

export const createPortalErrorBody = (code: string, message: string) => ({
  meta: createPortalApiMeta(false),
  error: {
    code,
    message,
  },
});
