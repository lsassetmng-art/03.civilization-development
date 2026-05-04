import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAuthResponse,
  PortalLoginRequest,
  PortalSignupRequest,
} from "../../types/portal-api";
import { fetchJson } from "./fetch-json";

const route = (key: string, fallback: string): string =>
  (API_ROUTES as Record<string, string>)[key] ?? fallback;

export const requestPortalLogin = async (
  request: PortalLoginRequest,
): Promise<PortalAuthResponse> =>
  fetchJson<PortalLoginRequest, PortalAuthResponse>(route("portalLogin", "/api/v1/portal/auth/login"), {
    method: "POST",
    body: request,
  });

export const requestPortalSignup = async (
  request: PortalSignupRequest,
): Promise<PortalAuthResponse> =>
  fetchJson<PortalSignupRequest, PortalAuthResponse>(route("portalSignup", "/api/v1/portal/auth/signup"), {
    method: "POST",
    body: request,
  });
