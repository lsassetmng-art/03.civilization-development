import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAdminNavigationManifestListRequest,
  PortalAdminNavigationManifestListResponse,
  PortalAdminNavigationManifestUpsertRequest,
  PortalAdminNavigationManifestUpsertResponse,
  PortalPublicMenuResolveRequest,
  PortalPublicMenuResolveResponse,
  PortalPublicNavigationManifestListRequest,
  PortalPublicNavigationManifestListResponse,
} from "../../types/portal-navigation-api";
import { fetchJson } from "./fetch-json";

export const requestPublicNavigationManifestList = async (
  request: PortalPublicNavigationManifestListRequest,
): Promise<PortalPublicNavigationManifestListResponse> =>
  fetchJson<
    PortalPublicNavigationManifestListRequest,
    PortalPublicNavigationManifestListResponse
  >(API_ROUTES.publicNavigationManifestList, {
    method: "POST",
    body: request,
  });

export const requestPublicMenuResolve = async (
  request: PortalPublicMenuResolveRequest,
): Promise<PortalPublicMenuResolveResponse> =>
  fetchJson<PortalPublicMenuResolveRequest, PortalPublicMenuResolveResponse>(
    API_ROUTES.publicNavigationMenuResolve,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminNavigationManifestList = async (
  request: PortalAdminNavigationManifestListRequest,
): Promise<PortalAdminNavigationManifestListResponse> =>
  fetchJson<
    PortalAdminNavigationManifestListRequest,
    PortalAdminNavigationManifestListResponse
  >(API_ROUTES.adminNavigationManifestList, {
    method: "POST",
    body: request,
  });

export const requestAdminNavigationManifestUpsert = async (
  request: PortalAdminNavigationManifestUpsertRequest,
): Promise<PortalAdminNavigationManifestUpsertResponse> =>
  fetchJson<
    PortalAdminNavigationManifestUpsertRequest,
    PortalAdminNavigationManifestUpsertResponse
  >(API_ROUTES.adminNavigationManifestUpsert, {
    method: "POST",
    body: request,
  });
