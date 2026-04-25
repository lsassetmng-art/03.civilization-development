import type { PortalApiMeta, PortalErrorResponse } from "../../types/portal-api";

export const PORTAL_API_VERSION = "2026-04-16.portal.v1" as const;

export const createPortalApiMeta = (success: boolean): PortalApiMeta => ({
  requestId: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
  version: PORTAL_API_VERSION,
  success,
});

export const createPortalErrorBody = (
  code: string,
  message: string,
  details?: Record<string, string>,
): PortalErrorResponse => ({
  meta: createPortalApiMeta(false),
  error: {
    code,
    message,
    details,
  },
});
