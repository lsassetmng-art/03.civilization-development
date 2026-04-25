import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalPublicSupportCenterGetRequest,
  PortalPublicSupportCenterGetResponse,
  PortalPublicSupportContactSubmitRequest,
  PortalPublicSupportContactSubmitResponse,
} from "../../types/portal-support-api";
import { fetchJson } from "./fetch-json";

export const requestPublicSupportCenterGet = async (
  request: PortalPublicSupportCenterGetRequest,
): Promise<PortalPublicSupportCenterGetResponse> =>
  fetchJson<
    PortalPublicSupportCenterGetRequest,
    PortalPublicSupportCenterGetResponse
  >(API_ROUTES.publicSupportCenterGet, {
    method: "POST",
    body: request,
  });

export const requestPublicSupportContactSubmit = async (
  request: PortalPublicSupportContactSubmitRequest,
): Promise<PortalPublicSupportContactSubmitResponse> =>
  fetchJson<
    PortalPublicSupportContactSubmitRequest,
    PortalPublicSupportContactSubmitResponse
  >(API_ROUTES.publicSupportContactSubmit, {
    method: "POST",
    body: request,
  });
