import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalPublicProfileSettingsGetRequest,
  PortalPublicProfileSettingsGetResponse,
  PortalPublicProfileSettingsUpsertRequest,
  PortalPublicProfileSettingsUpsertResponse,
} from "../../types/portal-profile-settings-api";
import { fetchJson } from "./fetch-json";

export const requestPublicProfileSettingsGet = async (
  request: PortalPublicProfileSettingsGetRequest,
): Promise<PortalPublicProfileSettingsGetResponse> =>
  fetchJson<
    PortalPublicProfileSettingsGetRequest,
    PortalPublicProfileSettingsGetResponse
  >(API_ROUTES.publicProfileSettingsGet, {
    method: "POST",
    body: request,
  });

export const requestPublicProfileSettingsUpsert = async (
  request: PortalPublicProfileSettingsUpsertRequest,
): Promise<PortalPublicProfileSettingsUpsertResponse> =>
  fetchJson<
    PortalPublicProfileSettingsUpsertRequest,
    PortalPublicProfileSettingsUpsertResponse
  >(API_ROUTES.publicProfileSettingsUpsert, {
    method: "POST",
    body: request,
  });
