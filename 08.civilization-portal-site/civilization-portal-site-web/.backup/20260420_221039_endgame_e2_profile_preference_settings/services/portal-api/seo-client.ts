import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAdminSeoPageListRequest,
  PortalAdminSeoPageListResponse,
  PortalAdminSeoPageUpsertRequest,
  PortalAdminSeoPageUpsertResponse,
  PortalPublicSeoPageGetRequest,
  PortalPublicSeoPageGetResponse,
} from "../../types/portal-seo-api";
import { fetchJson } from "./fetch-json";

export const requestPublicSeoPageGet = async (
  request: PortalPublicSeoPageGetRequest,
): Promise<PortalPublicSeoPageGetResponse> =>
  fetchJson<PortalPublicSeoPageGetRequest, PortalPublicSeoPageGetResponse>(
    API_ROUTES.publicSeoPageGet,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminSeoPageList = async (
  request: PortalAdminSeoPageListRequest,
): Promise<PortalAdminSeoPageListResponse> =>
  fetchJson<PortalAdminSeoPageListRequest, PortalAdminSeoPageListResponse>(
    API_ROUTES.adminSeoPageList,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminSeoPageUpsert = async (
  request: PortalAdminSeoPageUpsertRequest,
): Promise<PortalAdminSeoPageUpsertResponse> =>
  fetchJson<PortalAdminSeoPageUpsertRequest, PortalAdminSeoPageUpsertResponse>(
    API_ROUTES.adminSeoPageUpsert,
    {
      method: "POST",
      body: request,
    },
  );
