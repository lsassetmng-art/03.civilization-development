import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAdminNotificationCenterListRequest,
  PortalAdminNotificationCenterListResponse,
  PortalAdminNotificationCenterUpsertRequest,
  PortalAdminNotificationCenterUpsertResponse,
  PortalPublicNotificationAnnouncementAckRequest,
  PortalPublicNotificationAnnouncementAckResponse,
  PortalPublicNotificationCenterGetRequest,
  PortalPublicNotificationCenterGetResponse,
} from "../../types/portal-notification-api";
import { fetchJson } from "./fetch-json";

export const requestPublicNotificationCenterGet = async (
  request: PortalPublicNotificationCenterGetRequest,
): Promise<PortalPublicNotificationCenterGetResponse> =>
  fetchJson<
    PortalPublicNotificationCenterGetRequest,
    PortalPublicNotificationCenterGetResponse
  >(API_ROUTES.publicNotificationCenterGet, {
    method: "POST",
    body: request,
  });

export const requestPublicNotificationAnnouncementAck = async (
  request: PortalPublicNotificationAnnouncementAckRequest,
): Promise<PortalPublicNotificationAnnouncementAckResponse> =>
  fetchJson<
    PortalPublicNotificationAnnouncementAckRequest,
    PortalPublicNotificationAnnouncementAckResponse
  >(API_ROUTES.publicNotificationAnnouncementAck, {
    method: "POST",
    body: request,
  });

export const requestAdminNotificationCenterList = async (
  request: PortalAdminNotificationCenterListRequest,
): Promise<PortalAdminNotificationCenterListResponse> =>
  fetchJson<
    PortalAdminNotificationCenterListRequest,
    PortalAdminNotificationCenterListResponse
  >(API_ROUTES.adminNotificationCenterList, {
    method: "POST",
    body: request,
  });

export const requestAdminNotificationCenterUpsert = async (
  request: PortalAdminNotificationCenterUpsertRequest,
): Promise<PortalAdminNotificationCenterUpsertResponse> =>
  fetchJson<
    PortalAdminNotificationCenterUpsertRequest,
    PortalAdminNotificationCenterUpsertResponse
  >(API_ROUTES.adminNotificationCenterUpsert, {
    method: "POST",
    body: request,
  });
