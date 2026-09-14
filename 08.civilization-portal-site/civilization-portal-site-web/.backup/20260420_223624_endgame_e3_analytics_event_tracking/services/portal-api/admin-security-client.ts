import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAdminAccessCheckRequest,
  PortalAdminAccessCheckResponse,
  PortalAdminAuditAppendRequest,
  PortalAdminAuditAppendResponse,
  PortalAdminAuditListRequest,
  PortalAdminAuditListResponse,
} from "../../types/portal-admin-security-api";
import { fetchJson } from "./fetch-json";

export const requestAdminAccessCheck = async (
  request: PortalAdminAccessCheckRequest,
): Promise<PortalAdminAccessCheckResponse> =>
  fetchJson<PortalAdminAccessCheckRequest, PortalAdminAccessCheckResponse>(
    API_ROUTES.adminAccessCheck,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminAuditList = async (
  request: PortalAdminAuditListRequest,
): Promise<PortalAdminAuditListResponse> =>
  fetchJson<PortalAdminAuditListRequest, PortalAdminAuditListResponse>(
    API_ROUTES.adminAuditList,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminAuditAppend = async (
  request: PortalAdminAuditAppendRequest,
): Promise<PortalAdminAuditAppendResponse> =>
  fetchJson<PortalAdminAuditAppendRequest, PortalAdminAuditAppendResponse>(
    API_ROUTES.adminAuditAppend,
    {
      method: "POST",
      body: request,
    },
  );
