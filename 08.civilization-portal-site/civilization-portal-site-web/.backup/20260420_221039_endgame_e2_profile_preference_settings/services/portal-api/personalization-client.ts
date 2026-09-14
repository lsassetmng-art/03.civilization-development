import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalPersonalEntriesGetRequest,
  PortalPersonalEntriesGetResponse,
  PortalPersonalFavoriteUpsertRequest,
  PortalPersonalFavoriteUpsertResponse,
  PortalPersonalRecentAppendRequest,
  PortalPersonalRecentAppendResponse,
  PortalPersonalShortcutUpsertRequest,
  PortalPersonalShortcutUpsertResponse,
} from "../../types/portal-personalization-api";
import { fetchJson } from "./fetch-json";

export const requestPersonalEntriesGet = async (
  request: PortalPersonalEntriesGetRequest,
): Promise<PortalPersonalEntriesGetResponse> =>
  fetchJson<PortalPersonalEntriesGetRequest, PortalPersonalEntriesGetResponse>(
    API_ROUTES.publicPersonalEntriesGet,
    {
      method: "POST",
      body: request,
    },
  );

export const requestPersonalShortcutUpsert = async (
  request: PortalPersonalShortcutUpsertRequest,
): Promise<PortalPersonalShortcutUpsertResponse> =>
  fetchJson<
    PortalPersonalShortcutUpsertRequest,
    PortalPersonalShortcutUpsertResponse
  >(API_ROUTES.publicPersonalShortcutUpsert, {
    method: "POST",
    body: request,
  });

export const requestPersonalFavoriteUpsert = async (
  request: PortalPersonalFavoriteUpsertRequest,
): Promise<PortalPersonalFavoriteUpsertResponse> =>
  fetchJson<
    PortalPersonalFavoriteUpsertRequest,
    PortalPersonalFavoriteUpsertResponse
  >(API_ROUTES.publicPersonalFavoriteUpsert, {
    method: "POST",
    body: request,
  });

export const requestPersonalRecentAppend = async (
  request: PortalPersonalRecentAppendRequest,
): Promise<PortalPersonalRecentAppendResponse> =>
  fetchJson<
    PortalPersonalRecentAppendRequest,
    PortalPersonalRecentAppendResponse
  >(API_ROUTES.publicPersonalRecentAppend, {
    method: "POST",
    body: request,
  });
