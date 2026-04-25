import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalPublicListingListRequest,
  PortalPublicListingListResponse,
  PortalPublicMaintenanceListRequest,
  PortalPublicMaintenanceListResponse,
  PortalPublicNoticesListRequest,
  PortalPublicNoticesListResponse,
} from "../../types/portal-admin-api";
import { fetchJson } from "./fetch-json";

export const requestPublicNoticesList = async (
  request: PortalPublicNoticesListRequest,
): Promise<PortalPublicNoticesListResponse> =>
  fetchJson<PortalPublicNoticesListRequest, PortalPublicNoticesListResponse>(
    API_ROUTES.publicNoticesList,
    {
      method: "POST",
      body: request,
    },
  );

export const requestPublicMaintenanceList = async (
  request: PortalPublicMaintenanceListRequest,
): Promise<PortalPublicMaintenanceListResponse> =>
  fetchJson<PortalPublicMaintenanceListRequest, PortalPublicMaintenanceListResponse>(
    API_ROUTES.publicMaintenanceList,
    {
      method: "POST",
      body: request,
    },
  );

export const requestPublicListingList = async (
  request: PortalPublicListingListRequest,
): Promise<PortalPublicListingListResponse> =>
  fetchJson<PortalPublicListingListRequest, PortalPublicListingListResponse>(
    API_ROUTES.publicListingList,
    {
      method: "POST",
      body: request,
    },
  );
