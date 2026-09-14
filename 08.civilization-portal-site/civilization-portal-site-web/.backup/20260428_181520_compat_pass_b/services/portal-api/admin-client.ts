import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAdminListingListRequest,
  PortalAdminListingListResponse,
  PortalAdminListingUpsertRequest,
  PortalAdminListingUpsertResponse,
  PortalAdminMaintenanceListRequest,
  PortalAdminMaintenanceListResponse,
  PortalAdminMaintenanceUpsertRequest,
  PortalAdminMaintenanceUpsertResponse,
  PortalAdminNoticePublishRequest,
  PortalAdminNoticePublishResponse,
  PortalAdminNoticesListRequest,
  PortalAdminNoticesListResponse,
} from "../../types/portal-admin-api";
import { fetchJson } from "./fetch-json";

export const requestAdminNoticesList = async (
  request: PortalAdminNoticesListRequest,
): Promise<PortalAdminNoticesListResponse> =>
  fetchJson<PortalAdminNoticesListRequest, PortalAdminNoticesListResponse>(
    API_ROUTES.adminNoticesList,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminNoticePublish = async (
  request: PortalAdminNoticePublishRequest,
): Promise<PortalAdminNoticePublishResponse> =>
  fetchJson<PortalAdminNoticePublishRequest, PortalAdminNoticePublishResponse>(
    API_ROUTES.adminNoticePublish,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminMaintenanceList = async (
  request: PortalAdminMaintenanceListRequest,
): Promise<PortalAdminMaintenanceListResponse> =>
  fetchJson<PortalAdminMaintenanceListRequest, PortalAdminMaintenanceListResponse>(
    API_ROUTES.adminMaintenanceList,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminMaintenanceUpsert = async (
  request: PortalAdminMaintenanceUpsertRequest,
): Promise<PortalAdminMaintenanceUpsertResponse> =>
  fetchJson<
    PortalAdminMaintenanceUpsertRequest,
    PortalAdminMaintenanceUpsertResponse
  >(API_ROUTES.adminMaintenanceUpsert, {
    method: "POST",
    body: request,
  });

export const requestAdminListingList = async (
  request: PortalAdminListingListRequest,
): Promise<PortalAdminListingListResponse> =>
  fetchJson<PortalAdminListingListRequest, PortalAdminListingListResponse>(
    API_ROUTES.adminListingList,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminListingUpsert = async (
  request: PortalAdminListingUpsertRequest,
): Promise<PortalAdminListingUpsertResponse> =>
  fetchJson<PortalAdminListingUpsertRequest, PortalAdminListingUpsertResponse>(
    API_ROUTES.adminListingUpsert,
    {
      method: "POST",
      body: request,
    },
  );
