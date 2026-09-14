import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAdminSearchIndexListRequest,
  PortalAdminSearchIndexListResponse,
  PortalAdminSearchIndexUpsertRequest,
  PortalAdminSearchIndexUpsertResponse,
  PortalSearchQueryRequest,
  PortalSearchQueryResponse,
} from "../../types/portal-search-api";
import { fetchJson } from "./fetch-json";

export const requestPublicSearchQuery = async (
  request: PortalSearchQueryRequest,
): Promise<PortalSearchQueryResponse> =>
  fetchJson<PortalSearchQueryRequest, PortalSearchQueryResponse>(
    API_ROUTES.publicSearchQuery,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminSearchIndexList = async (
  request: PortalAdminSearchIndexListRequest,
): Promise<PortalAdminSearchIndexListResponse> =>
  fetchJson<PortalAdminSearchIndexListRequest, PortalAdminSearchIndexListResponse>(
    API_ROUTES.adminSearchIndexList,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminSearchIndexUpsert = async (
  request: PortalAdminSearchIndexUpsertRequest,
): Promise<PortalAdminSearchIndexUpsertResponse> =>
  fetchJson<
    PortalAdminSearchIndexUpsertRequest,
    PortalAdminSearchIndexUpsertResponse
  >(API_ROUTES.adminSearchIndexUpsert, {
    method: "POST",
    body: request,
  });
