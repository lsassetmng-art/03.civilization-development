import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalPublicAssetManifestListRequest,
  PortalPublicAssetManifestListResponse,
  PortalPublicCmsPageGetRequest,
  PortalPublicCmsPageGetResponse,
  PortalPublicListingListRequest,
  PortalPublicListingListResponse,
  PortalPublicMaintenanceListRequest,
  PortalPublicMaintenanceListResponse,
  PortalPublicNoticesListRequest,
  PortalPublicNoticesListResponse,
  PortalPublicSeoPageGetRequest,
  PortalPublicSeoPageGetResponse,
} from "../../types/portal-admin-api";
import { fetchJson } from "./fetch-json";

const route = (key: string, fallback: string): string =>
  (API_ROUTES as Record<string, string>)[key] ?? fallback;

export const requestPublicListingList = async (
  request: PortalPublicListingListRequest,
): Promise<PortalPublicListingListResponse> =>
  fetchJson<PortalPublicListingListRequest, PortalPublicListingListResponse>(
    route("publicListingList", "/api/v1/portal/public/listing/list"),
    { method: "POST", body: request },
  );

export const requestPublicMaintenanceList = async (
  request: PortalPublicMaintenanceListRequest,
): Promise<PortalPublicMaintenanceListResponse> =>
  fetchJson<PortalPublicMaintenanceListRequest, PortalPublicMaintenanceListResponse>(
    route("publicMaintenanceList", "/api/v1/portal/public/maintenance/list"),
    { method: "POST", body: request },
  );

export const requestPublicNoticesList = async (
  request: PortalPublicNoticesListRequest,
): Promise<PortalPublicNoticesListResponse> =>
  fetchJson<PortalPublicNoticesListRequest, PortalPublicNoticesListResponse>(
    route("publicNoticesList", "/api/v1/portal/public/notices/list"),
    { method: "POST", body: request },
  );

export const requestPublicCmsPageGet = async (
  request: PortalPublicCmsPageGetRequest,
): Promise<PortalPublicCmsPageGetResponse> =>
  fetchJson<PortalPublicCmsPageGetRequest, PortalPublicCmsPageGetResponse>(
    route("publicCmsPageGet", "/api/v1/portal/public/cms/page/get"),
    { method: "POST", body: request },
  );

export const requestPublicAssetManifestList = async (
  request: PortalPublicAssetManifestListRequest,
): Promise<PortalPublicAssetManifestListResponse> =>
  fetchJson<PortalPublicAssetManifestListRequest, PortalPublicAssetManifestListResponse>(
    route("publicAssetManifestList", "/api/v1/portal/public/asset/manifest/list"),
    { method: "POST", body: request },
  );

export const requestPublicSeoPageGet = async (
  request: PortalPublicSeoPageGetRequest,
): Promise<PortalPublicSeoPageGetResponse> =>
  fetchJson<PortalPublicSeoPageGetRequest, PortalPublicSeoPageGetResponse>(
    route("publicSeoPageGet", "/api/v1/portal/public/seo/page/get"),
    { method: "POST", body: request },
  );
