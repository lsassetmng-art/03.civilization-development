import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAdminCmsPageListRequest,
  PortalAdminCmsPageListResponse,
  PortalAdminCmsPageUpsertRequest,
  PortalAdminCmsPageUpsertResponse,
  PortalPublicCmsPageGetRequest,
  PortalPublicCmsPageGetResponse,
} from "../../types/portal-cms-api";
import { fetchJson } from "./fetch-json";

export const requestPublicCmsPageGet = async (
  request: PortalPublicCmsPageGetRequest,
): Promise<PortalPublicCmsPageGetResponse> =>
  fetchJson<PortalPublicCmsPageGetRequest, PortalPublicCmsPageGetResponse>(
    API_ROUTES.publicCmsPageGet,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminCmsPageList = async (
  request: PortalAdminCmsPageListRequest,
): Promise<PortalAdminCmsPageListResponse> =>
  fetchJson<PortalAdminCmsPageListRequest, PortalAdminCmsPageListResponse>(
    API_ROUTES.adminCmsPageList,
    {
      method: "POST",
      body: request,
    },
  );

export const requestAdminCmsPageUpsert = async (
  request: PortalAdminCmsPageUpsertRequest,
): Promise<PortalAdminCmsPageUpsertResponse> =>
  fetchJson<PortalAdminCmsPageUpsertRequest, PortalAdminCmsPageUpsertResponse>(
    API_ROUTES.adminCmsPageUpsert,
    {
      method: "POST",
      body: request,
    },
  );
