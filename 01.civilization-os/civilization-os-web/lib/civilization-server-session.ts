import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";

export const CIVILIZATION_SERVER_SESSION_COOKIE_NAME =
  "civilization_os_server_session_v1";

const VERSION = 1;
const SECRET_ENV = "CIVILIZATION_SESSION_SIGNING_SECRET";
const MIN_SECRET_LENGTH = 32;

export type CivilizationServerSession = {
  version: 1;
  civilizationId: string;
  provider?: string;
  issuedAt: string;
  expiresAt: string;
  localeCode?: string;
  languageCode?: string;
  requestedOsCode?: string;
};

export type CivilizationServerSessionReadResult =
  | {
      status: "ok";
      session: CivilizationServerSession;
    }
  | {
      status:
        | "not_configured"
        | "missing"
        | "invalid"
        | "expired";
    };

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(
  source: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = source[key];

    if (
      typeof value === "string" &&
      value.trim().length > 0
    ) {
      return value.trim();
    }
  }

  return undefined;
}

function signingSecret(): string | null {
  const value = process.env[SECRET_ENV];

  if (
    typeof value !== "string" ||
    value.length < MIN_SECRET_LENGTH
  ) {
    return null;
  }

  return value;
}

export function civilizationServerSessionConfigured(): boolean {
  return signingSecret() !== null;
}

function normalizeSession(
  input: unknown
): CivilizationServerSession | null {
  if (!isRecord(input)) {
    return null;
  }

  const civilizationId = readString(
    input,
    "civilizationId",
    "civilization_id"
  );

  const issuedAt = readString(
    input,
    "issuedAt",
    "issued_at",
    "createdAt",
    "created_at"
  );

  const expiresAt = readString(
    input,
    "expiresAt",
    "expires_at"
  );

  if (
    !civilizationId ||
    !issuedAt ||
    !expiresAt
  ) {
    return null;
  }

  const issuedAtMs = Date.parse(issuedAt);
  const expiresAtMs = Date.parse(expiresAt);

  if (
    !Number.isFinite(issuedAtMs) ||
    !Number.isFinite(expiresAtMs) ||
    expiresAtMs <= issuedAtMs
  ) {
    return null;
  }

  return {
    version: VERSION,
    civilizationId,
    provider: readString(input, "provider"),
    issuedAt,
    expiresAt,
    localeCode: readString(
      input,
      "localeCode",
      "locale_code"
    ),
    languageCode: readString(
      input,
      "languageCode",
      "language_code"
    ),
    requestedOsCode: readString(
      input,
      "requestedOsCode",
      "requested_os_code"
    )
  };
}

function encodePayload(
  session: CivilizationServerSession
): string {
  return Buffer.from(
    JSON.stringify(session),
    "utf8"
  ).toString("base64url");
}

function signatureFor(
  payload: string,
  secret: string
): string {
  return createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("base64url");
}

function signaturesEqual(
  actual: string,
  expected: string
): boolean {
  try {
    const actualBuffer =
      Buffer.from(actual, "base64url");

    const expectedBuffer =
      Buffer.from(expected, "base64url");

    return (
      actualBuffer.length === expectedBuffer.length &&
      timingSafeEqual(
        actualBuffer,
        expectedBuffer
      )
    );
  } catch {
    return false;
  }
}

function encodeToken(
  session: CivilizationServerSession,
  secret: string
): string {
  const payload = encodePayload(session);

  return (
    payload +
    "." +
    signatureFor(payload, secret)
  );
}

function decodeToken(
  token: string,
  secret: string
): CivilizationServerSessionReadResult {
  const parts = token.split(".");

  if (
    parts.length !== 2 ||
    !parts[0] ||
    !parts[1]
  ) {
    return { status: "invalid" };
  }

  const payload = parts[0];
  const signature = parts[1];
  const expected = signatureFor(
    payload,
    secret
  );

  if (
    !signaturesEqual(
      signature,
      expected
    )
  ) {
    return { status: "invalid" };
  }

  let raw: unknown;

  try {
    raw = JSON.parse(
      Buffer.from(
        payload,
        "base64url"
      ).toString("utf8")
    );
  } catch {
    return { status: "invalid" };
  }

  const session = normalizeSession(raw);

  if (!session) {
    return { status: "invalid" };
  }

  if (
    Date.parse(session.expiresAt) <=
    Date.now()
  ) {
    return { status: "expired" };
  }

  return {
    status: "ok",
    session
  };
}

export function setCivilizationServerSessionCookie(
  response: NextResponse,
  sessionInput: unknown,
  secure: boolean
): boolean {
  const secret = signingSecret();

  if (!secret) {
    return false;
  }

  const session = normalizeSession(
    sessionInput
  );

  if (!session) {
    return false;
  }

  const expiresAtMs =
    Date.parse(session.expiresAt);

  if (expiresAtMs <= Date.now()) {
    return false;
  }

  response.cookies.set(
    CIVILIZATION_SERVER_SESSION_COOKIE_NAME,
    encodeToken(
      session,
      secret
    ),
    {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: Math.max(
        1,
        Math.floor(
          (expiresAtMs - Date.now()) /
            1000
        )
      )
    }
  );

  return true;
}

export function clearCivilizationServerSessionCookie(
  response: NextResponse,
  secure: boolean
): void {
  response.cookies.set(
    CIVILIZATION_SERVER_SESSION_COOKIE_NAME,
    "",
    {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0
    }
  );
}

export function readCivilizationServerSession(
  request: NextRequest
): CivilizationServerSessionReadResult {
  const secret = signingSecret();

  if (!secret) {
    return {
      status: "not_configured"
    };
  }

  const token = request.cookies.get(
    CIVILIZATION_SERVER_SESSION_COOKIE_NAME
  )?.value;

  if (!token) {
    return {
      status: "missing"
    };
  }

  return decodeToken(
    token,
    secret
  );
}
