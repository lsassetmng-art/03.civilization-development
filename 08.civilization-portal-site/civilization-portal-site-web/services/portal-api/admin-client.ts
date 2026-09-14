import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAdminAssetManifestListRequest,
  PortalAdminAssetManifestListResponse,
  PortalAdminAssetManifestUpsertRequest,
  PortalAdminAssetManifestUpsertResponse,
  PortalAdminCmsPageListRequest,
  PortalAdminCmsPageListResponse,
  PortalAdminCmsPageUpsertRequest,
  PortalAdminCmsPageUpsertResponse,
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
  PortalAdminSeoPageListRequest,
  PortalAdminSeoPageListResponse,
  PortalAdminSeoPageUpsertRequest,
  PortalAdminSeoPageUpsertResponse,
} from "../../types/portal-admin-api";
import { fetchJson } from "./fetch-json";

const route = (key: string, fallback: string): string =>
  (API_ROUTES as Record<string, string>)[key] ?? fallback;

export const requestAdminListingList = async (
  request: PortalAdminListingListRequest,
): Promise<PortalAdminListingListResponse> =>
  fetchJson(route("adminListingList", "/api/v1/portal/admin/listing/list"), {
    method: "POST",
    body: request,
  });

export const requestAdminListingUpsert = async (
  request: PortalAdminListingUpsertRequest,
): Promise<PortalAdminListingUpsertResponse> =>
  fetchJson(route("adminListingUpsert", "/api/v1/portal/admin/listing/upsert"), {
    method: "POST",
    body: request,
  });

export const requestAdminMaintenanceList = async (
  request: PortalAdminMaintenanceListRequest,
): Promise<PortalAdminMaintenanceListResponse> =>
  fetchJson(route("adminMaintenanceList", "/api/v1/portal/admin/maintenance/list"), {
    method: "POST",
    body: request,
  });

export const requestAdminMaintenanceUpsert = async (
  request: PortalAdminMaintenanceUpsertRequest,
): Promise<PortalAdminMaintenanceUpsertResponse> =>
  fetchJson(route("adminMaintenanceUpsert", "/api/v1/portal/admin/maintenance/upsert"), {
    method: "POST",
    body: request,
  });

export const requestAdminNoticesList = async (
  request: PortalAdminNoticesListRequest,
): Promise<PortalAdminNoticesListResponse> =>
  fetchJson(route("adminNoticesList", "/api/v1/portal/admin/notices/list"), {
    method: "POST",
    body: request,
  });

export const requestAdminNoticePublish = async (
  request: PortalAdminNoticePublishRequest,
): Promise<PortalAdminNoticePublishResponse> =>
  fetchJson(route("adminNoticePublish", "/api/v1/portal/admin/notices/publish"), {
    method: "POST",
    body: request,
  });

export const requestAdminCmsPageList = async (
  request: PortalAdminCmsPageListRequest,
): Promise<PortalAdminCmsPageListResponse> =>
  fetchJson(route("adminCmsPageList", "/api/v1/portal/admin/cms/page/list"), {
    method: "POST",
    body: request,
  });

export const requestAdminCmsPageUpsert = async (
  request: PortalAdminCmsPageUpsertRequest,
): Promise<PortalAdminCmsPageUpsertResponse> =>
  fetchJson(route("adminCmsPageUpsert", "/api/v1/portal/admin/cms/page/upsert"), {
    method: "POST",
    body: request,
  });

export const requestAdminAssetManifestList = async (
  request: PortalAdminAssetManifestListRequest,
): Promise<PortalAdminAssetManifestListResponse> =>
  fetchJson(route("adminAssetManifestList", "/api/v1/portal/admin/asset/manifest/list"), {
    method: "POST",
    body: request,
  });

export const requestAdminAssetManifestUpsert = async (
  request: PortalAdminAssetManifestUpsertRequest,
): Promise<PortalAdminAssetManifestUpsertResponse> =>
  fetchJson(route("adminAssetManifestUpsert", "/api/v1/portal/admin/asset/manifest/upsert"), {
    method: "POST",
    body: request,
  });

export const requestAdminSeoPageList = async (
  request: PortalAdminSeoPageListRequest,
): Promise<PortalAdminSeoPageListResponse> =>
  fetchJson(route("adminSeoPageList", "/api/v1/portal/admin/seo/page/list"), {
    method: "POST",
    body: request,
  });

export const requestAdminSeoPageUpsert = async (
  request: PortalAdminSeoPageUpsertRequest,
): Promise<PortalAdminSeoPageUpsertResponse> =>
  fetchJson(route("adminSeoPageUpsert", "/api/v1/portal/admin/seo/page/upsert"), {
    method: "POST",
    body: request,
  });
