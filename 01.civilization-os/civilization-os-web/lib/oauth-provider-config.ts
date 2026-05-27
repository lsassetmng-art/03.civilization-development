export const oauthProviderCodes = ["google", "yahoo"] as const;

export type OAuthProviderCode = (typeof oauthProviderCodes)[number];

export type OAuthProviderConfig = {
  provider: OAuthProviderCode;
  displayName: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userinfoEndpoint: string;
  scopes: string[];
  clientIdEnvName: string;
  clientSecretEnvName: string;
  tokenClientAuth: "client_secret_post" | "client_secret_basic";
};

export type OAuthProviderEnv = {
  publicBaseUrl: string;
  clientId: string;
  clientSecret: string;
  missingEnvNames: string[];
};

const baseUrlEnvNames = [
  "CIVILIZATION_OS_PUBLIC_BASE_URL",
  "NEXT_PUBLIC_CIVILIZATION_OS_BASE_URL"
] as const;

const providerConfigs: Record<OAuthProviderCode, OAuthProviderConfig> = {
  google: {
    provider: "google",
    displayName: "Google",
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    userinfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
    scopes: ["openid", "email", "profile"],
    clientIdEnvName: "GOOGLE_CLIENT_ID",
    clientSecretEnvName: "GOOGLE_CLIENT_SECRET",
    tokenClientAuth: "client_secret_post"
  },
  yahoo: {
    provider: "yahoo",
    displayName: "Yahoo! JAPAN",
    authorizationEndpoint: "https://auth.login.yahoo.co.jp/yconnect/v2/authorization",
    tokenEndpoint: "https://auth.login.yahoo.co.jp/yconnect/v2/token",
    userinfoEndpoint: "https://userinfo.yahooapis.jp/yconnect/v2/attribute",
    scopes: ["openid", "email", "profile"],
    clientIdEnvName: "YAHOO_CLIENT_ID",
    clientSecretEnvName: "YAHOO_CLIENT_SECRET",
    tokenClientAuth: "client_secret_basic"
  }
};

function readRuntimeEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function normalizePublicBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function parseOAuthProvider(value: string | null | undefined): OAuthProviderCode | null {
  if (value === "google" || value === "yahoo") {
    return value;
  }
  return null;
}

export function getOAuthProviderConfig(provider: OAuthProviderCode): OAuthProviderConfig {
  return providerConfigs[provider];
}

export function resolveOAuthProviderEnv(provider: OAuthProviderCode): OAuthProviderEnv {
  const config = getOAuthProviderConfig(provider);
  const publicBaseUrl =
    readRuntimeEnv("CIVILIZATION_OS_PUBLIC_BASE_URL") ||
    readRuntimeEnv("NEXT_PUBLIC_CIVILIZATION_OS_BASE_URL");
  const clientId = readRuntimeEnv(config.clientIdEnvName);
  const clientSecret = readRuntimeEnv(config.clientSecretEnvName);

  const missingEnvNames: string[] = [];
  if (!publicBaseUrl) {
    missingEnvNames.push(baseUrlEnvNames.join("|"));
  }
  if (!clientId) {
    missingEnvNames.push(config.clientIdEnvName);
  }
  if (!clientSecret) {
    missingEnvNames.push(config.clientSecretEnvName);
  }

  return {
    publicBaseUrl: normalizePublicBaseUrl(publicBaseUrl),
    clientId,
    clientSecret,
    missingEnvNames
  };
}

export function buildOAuthRedirectUri(provider: OAuthProviderCode, publicBaseUrl: string): string {
  return normalizePublicBaseUrl(publicBaseUrl) + "/api/civilization/auth/oauth/callback/" + provider;
}

export function buildOAuthAuthorizationUrl(input: {
  provider: OAuthProviderCode;
  state: string;
  languageCode: string;
  afterLoginPath: string;
  returnTo: string;
}): { authorizationUrl: URL; missingEnvNames: string[] } {
  const config = getOAuthProviderConfig(input.provider);
  const env = resolveOAuthProviderEnv(input.provider);

  const authorizationUrl = new URL(config.authorizationEndpoint);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", env.clientId);
  authorizationUrl.searchParams.set("redirect_uri", buildOAuthRedirectUri(input.provider, env.publicBaseUrl));
  authorizationUrl.searchParams.set("scope", config.scopes.join(" "));
  authorizationUrl.searchParams.set("state", input.state);

  if (input.provider === "google") {
    authorizationUrl.searchParams.set("prompt", "select_account");
    authorizationUrl.searchParams.set("include_granted_scopes", "true");
  }

  return {
    authorizationUrl,
    missingEnvNames: env.missingEnvNames
  };
}
