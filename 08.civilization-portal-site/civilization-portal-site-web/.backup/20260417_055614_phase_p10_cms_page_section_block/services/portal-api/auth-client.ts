import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAuthResponse,
  PortalLoginRequest,
  PortalSignupRequest,
} from "../../types/portal-api";
import { fetchJson } from "./fetch-json";

export const requestPortalLogin = async (
  request: PortalLoginRequest,
): Promise<PortalAuthResponse> =>
  fetchJson<PortalLoginRequest, PortalAuthResponse>(API_ROUTES.portalLogin, {
    method: "POST",
    body: request,
  });

export const requestPortalSignup = async (
  request: PortalSignupRequest,
): Promise<PortalAuthResponse> =>
  fetchJson<PortalSignupRequest, PortalAuthResponse>(API_ROUTES.portalSignup, {
    method: "POST",
    body: request,
  });
