import { createHash } from "crypto";
import {
  buildOAuthRedirectUri,
  getOAuthProviderConfig,
  parseOAuthProvider,
  resolveOAuthProviderEnv,
  type OAuthProviderCode
} from "@/lib/oauth-provider-config";
import {
  decodeOAuthCallbackContext,
  normalizeSafeRedirectPath,
  OAUTH_CONTEXT_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
  type OAuthCallbackContext
} from "@/lib/oauth-state";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

type TokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

type ProviderUserInfo = Record<string, unknown>;

const CIVILIZATION_OAUTH_SESSION_STORAGE_KEY = "civilization_os_session_v1";

function htmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function jsonForHtmlScript(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function safeString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function hashProviderSubject(provider: OAuthProviderCode, subject: string): string {
  return createHash("sha256").update(provider + ":" + subject).digest("hex");
}

function clearOAuthCookies(response: NextResponse) {
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax"
  });

  response.cookies.set(OAUTH_CONTEXT_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax"
  });
}

function authErrorResponse(input: {
  provider: string;
  errorCode: string;
  message: string;
  status: number;
  afterLoginPath?: string;
}) {
  const retryPath = normalizeSafeRedirectPath(input.afterLoginPath, "/login");
  const body = [
    "<!doctype html>",
    '<html lang="ja">',
    "<head>",
    '<meta charSet="utf-8" />',
    '<meta name="viewport" content="width=device-width,initial-scale=1" />',
    "<title>CivilizationOS OAuth Error</title>",
    "</head>",
    "<body>",
    '<main style="font-family: system-ui, sans-serif; padding: 24px;">',
    "<h1>CivilizationOS OAuth Error</h1>",
    '<p data-civilization-oauth-error="' + htmlEscape(input.errorCode) + '">' + htmlEscape(input.message) + "</p>",
    "<p>provider: " + htmlEscape(input.provider) + "</p>",
    '<a href="' + htmlEscape(retryPath) + '">戻る</a>',
    "</main>",
    "</body>",
    "</html>"
  ].join("");

  const response = new NextResponse(body, {
    status: input.status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });

  clearOAuthCookies(response);
  return response;
}

async function exchangeAuthorizationCode(input: {
  provider: OAuthProviderCode;
  code: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const config = getOAuthProviderConfig(input.provider);
  const env = resolveOAuthProviderEnv(input.provider);

  if (env.missingEnvNames.length > 0) {
    throw new Error("oauth_not_configured");
  }

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", input.code);
  body.set("redirect_uri", input.redirectUri);

  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": "application/x-www-form-urlencoded"
  };

  if (config.tokenClientAuth === "client_secret_basic") {
    headers.authorization = "Basic " + Buffer.from(env.clientId + ":" + env.clientSecret).toString("base64");
  } else {
    body.set("client_id", env.clientId);
    body.set("client_secret", env.clientSecret);
  }

  const tokenResponse = await fetch(config.tokenEndpoint, {
    method: "POST",
    headers,
    body,
    cache: "no-store"
  });

  const tokenPayload = (await tokenResponse.json().catch(() => ({}))) as TokenResponse;

  if (!tokenResponse.ok || !tokenPayload.access_token) {
    throw new Error("token_exchange_failed:" + tokenResponse.status);
  }

  return tokenPayload;
}

async function fetchProviderUserInfo(provider: OAuthProviderCode, accessToken: string): Promise<ProviderUserInfo> {
  const config = getOAuthProviderConfig(provider);
  const userInfoResponse = await fetch(config.userinfoEndpoint, {
    headers: {
      accept: "application/json",
      authorization: "Bearer " + accessToken
    },
    cache: "no-store"
  });

  const payload = (await userInfoResponse.json().catch(() => ({}))) as ProviderUserInfo;

  if (!userInfoResponse.ok) {
    throw new Error("userinfo_failed:" + userInfoResponse.status);
  }

  return payload;
}

function buildSessionFromUserInfo(input: {
  provider: OAuthProviderCode;
  userInfo: ProviderUserInfo;
  context: OAuthCallbackContext;
}) {
  const subject =
    safeString(input.userInfo.sub) ??
    safeString(input.userInfo.id) ??
    safeString(input.userInfo.user_id);

  if (!subject) {
    throw new Error("provider_subject_missing");
  }

  const providerSubjectHash = hashProviderSubject(input.provider, subject);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);

  return {
    civilizationId: "oauth:" + input.provider + ":" + providerSubjectHash.slice(0, 32),
    loginMethod: input.provider,
    provider: input.provider,
    providerSubjectHash,
    displayName:
      safeString(input.userInfo.name) ??
      safeString(input.userInfo.display_name) ??
      safeString(input.userInfo.nickname) ??
      input.provider + " user",
    email: safeString(input.userInfo.email),
    languageCode: input.context.languageCode,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
}

function sessionHandoffResponse(sessionPayload: unknown, afterLoginPath: string) {
  const safeAfterLoginPath = normalizeSafeRedirectPath(afterLoginPath, "/civilization-menu");
  const sessionPayloadJson = jsonForHtmlScript(sessionPayload);
  const storageKeyJson = jsonForHtmlScript(CIVILIZATION_OAUTH_SESSION_STORAGE_KEY);
  const redirectJson = jsonForHtmlScript(safeAfterLoginPath);

  const body = [
    "<!doctype html>",
    '<html lang="ja">',
    "<head>",
    '<meta charSet="utf-8" />',
    '<meta name="viewport" content="width=device-width,initial-scale=1" />',
    "<title>CivilizationOS OAuth Return</title>",
    "</head>",
    "<body>",
    '<main style="font-family: system-ui, sans-serif; padding: 24px;">',
    "<h1>CivilizationOS</h1>",
    "<p>ログイン情報を保存しています。</p>",
    "<noscript>",
    "<p>JavaScriptを有効にしてから続行してください。</p>",
    '<a href="' + htmlEscape(safeAfterLoginPath) + '">続行</a>',
    "</noscript>",
    "</main>",
    "<script>",
    "(function () {",
    "var key = " + storageKeyJson + ";",
    "var session = " + sessionPayloadJson + ";",
    "var redirectTo = " + redirectJson + ";",
    "try {",
    "localStorage.setItem(key, JSON.stringify(session));",
    "} catch (error) {",
    'console.error("CivilizationOS OAuth session save failed");',
    "}",
    "window.location.replace(redirectTo);",
    "})();",
    "</script>",
    "</body>",
    "</html>"
  ].join("");

  const response = new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });

  clearOAuthCookies(response);
  return response;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const provider = parseOAuthProvider(params.provider);

  if (!provider) {
    return authErrorResponse({
      provider: params.provider,
      errorCode: "invalid_oauth_provider",
      message: "Unsupported CivilizationOS OAuth provider.",
      status: 400
    });
  }

  const providerError = request.nextUrl.searchParams.get("error");
  if (providerError) {
    return authErrorResponse({
      provider,
      errorCode: "oauth_provider_error",
      message: "OAuth provider returned an error: " + providerError,
      status: 400
    });
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return authErrorResponse({
      provider,
      errorCode: "oauth_code_missing",
      message: "OAuth authorization code is missing.",
      status: 400
    });
  }

  const callbackState = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;

  if (!callbackState || !expectedState || callbackState !== expectedState) {
    return authErrorResponse({
      provider,
      errorCode: "oauth_state_mismatch",
      message: "OAuth state is missing or invalid.",
      status: 400
    });
  }

  const contextCookie = decodeOAuthCallbackContext(request.cookies.get(OAUTH_CONTEXT_COOKIE_NAME)?.value);
  if (!contextCookie || contextCookie.provider !== provider) {
    return authErrorResponse({
      provider,
      errorCode: "oauth_context_missing",
      message: "OAuth callback context is missing or invalid.",
      status: 400
    });
  }

  const env = resolveOAuthProviderEnv(provider);
  if (env.missingEnvNames.length > 0) {
    return authErrorResponse({
      provider,
      errorCode: "oauth_not_configured",
      message: "CivilizationOS OAuth provider is not configured.",
      status: 503,
      afterLoginPath: contextCookie.returnTo
    });
  }

  try {
    const redirectUri = buildOAuthRedirectUri(provider, env.publicBaseUrl);
    const tokenPayload = await exchangeAuthorizationCode({
      provider,
      code,
      redirectUri
    });
    const userInfo = await fetchProviderUserInfo(provider, tokenPayload.access_token as string);
    const sessionPayload = buildSessionFromUserInfo({
      provider,
      userInfo,
      context: contextCookie
    });

    return sessionHandoffResponse(sessionPayload, contextCookie.afterLoginPath);
  } catch {
    return authErrorResponse({
      provider,
      errorCode: "oauth_callback_failed",
      message: "CivilizationOS OAuth callback failed safely.",
      status: 502,
      afterLoginPath: contextCookie.returnTo
    });
  }
}
