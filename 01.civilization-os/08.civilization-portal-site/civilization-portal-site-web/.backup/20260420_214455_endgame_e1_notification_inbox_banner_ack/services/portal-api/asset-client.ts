import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAdminAssetManifestListRequest,
  PortalAdminAssetManifestListResponse,
  PortalAdminAssetManifestUpsertRequest,
  PortalAdminAssetManifestUpsertResponse,
  PortalPublicAssetManifestListRequest,
  PortalPublicAssetManifestListResponse,
} from "../../types/portal-asset-api";
import { fetchJson } from "./fetch-json";

export const requestPublicAssetManifestList = async (
  request: PortalPublicAssetManifestListRequest,
): Promise<PortalPublicAssetManifestListResponse> =>
  fetchJson<
    PortalPublicAssetManifestListRequest,
    PortalPublicAssetManifestListResponse
  >(API_ROUTES.publicAssetManifestList, {
    method: "POST",
    body: request,
  });

export const requestAdminAssetManifestList = async (
  request: PortalAdminAssetManifestListRequest,
): Promise<PortalAdminAssetManifestListResponse> =>
  fetchJson<
    PortalAdminAssetManifestListRequest,
    PortalAdminAssetManifestListResponse
  >(API_ROUTES.adminAssetManifestList, {
    method: "POST",
    body: request,
  });

export const requestAdminAssetManifestUpsert = async (
  request: PortalAdminAssetManifestUpsertRequest,
): Promise<PortalAdminAssetManifestUpsertResponse> =>
  fetchJson<
    PortalAdminAssetManifestUpsertRequest,
    PortalAdminAssetManifestUpsertResponse
  >(API_ROUTES.adminAssetManifestUpsert, {
    method: "POST",
    body: request,
  });
