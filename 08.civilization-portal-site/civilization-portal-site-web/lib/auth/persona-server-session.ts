import {
  createHmac,
  timingSafeEqual
} from "crypto";

import type {
  NextResponse
} from "next/server";

export const PERSONA_SESSION_COOKIE_NAME =
  "portal_persona_server_session_v1";

const SESSION_TTL_MS =
  8 * 60 * 60 * 1000;

type CookieSource = {
  cookies: {
    get:
      (
        name: string
      ) =>
        | {
            value: string;
          }
        | undefined;
  };
};

export type PersonaSession = {
  version: 1;
  serverSessionActorKey: string;
  issuedAt: string;
  expiresAt: string;
};

export type PersonaSessionReadResult =
  | {
      status: "ok";
      session: PersonaSession;
    }
  | {
      status:
        | "missing"
        | "invalid"
        | "expired"
        | "not_configured";
    };

function secret():
  string |
  null {
  const value =
    process.env
      .PORTAL_PERSONA_SESSION_SIGNING_SECRET;

  return (
    typeof value === "string" &&
    value.length >= 32
  )
    ? value
    : null;
}

function validActor(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 256 &&
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}

function sign(
  payload: string,
  key: string
): string {
  return createHmac(
    "sha256",
    key
  )
    .update(payload, "utf8")
    .digest("base64url");
}

function safeSignatureEqual(
  left: string,
  right: string
): boolean {
  try {
    const a =
      Buffer.from(
        left,
        "base64url"
      );

    const b =
      Buffer.from(
        right,
        "base64url"
      );

    return (
      a.length === b.length &&
      timingSafeEqual(a, b)
    );
  } catch {
    return false;
  }
}

function encode(
  session: PersonaSession,
  key: string
): string {
  const payload =
    Buffer.from(
      JSON.stringify(session),
      "utf8"
    ).toString(
      "base64url"
    );

  return (
    payload +
    "." +
    sign(payload, key)
  );
}

function decode(
  value: string,
  key: string
): PersonaSession |
  null {
  const parts =
    value.split(".");

  if (
    parts.length !== 2 ||
    !parts[0] ||
    !parts[1]
  ) {
    return null;
  }

  const expected =
    sign(
      parts[0],
      key
    );

  if (
    !safeSignatureEqual(
      parts[1],
      expected
    )
  ) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(
        Buffer.from(
          parts[0],
          "base64url"
        ).toString("utf8")
      ) as Partial<PersonaSession>;

    if (
      parsed.version !== 1 ||
      !validActor(
        parsed.serverSessionActorKey
      ) ||
      typeof parsed.issuedAt !==
        "string" ||
      typeof parsed.expiresAt !==
        "string"
    ) {
      return null;
    }

    return parsed as
      PersonaSession;
  } catch {
    return null;
  }
}

export function personaServerSessionConfigured():
  boolean {
  return Boolean(secret());
}

export function createPersonaServerSession(
  serverSessionActorKey: string
): PersonaSession |
  null {
  if (
    !validActor(
      serverSessionActorKey
    )
  ) {
    return null;
  }

  const issuedAtMs =
    Date.now();

  return {
    version: 1,
    serverSessionActorKey,
    issuedAt:
      new Date(
        issuedAtMs
      ).toISOString(),
    expiresAt:
      new Date(
        issuedAtMs +
        SESSION_TTL_MS
      ).toISOString()
  };
}

export function readPersonaServerSession(
  source: CookieSource
): PersonaSessionReadResult {
  const key =
    secret();

  if (!key) {
    return {
      status:
        "not_configured"
    };
  }

  const raw =
    source.cookies
      .get(
        PERSONA_SESSION_COOKIE_NAME
      )
      ?.value;

  if (!raw) {
    return {
      status: "missing"
    };
  }

  const session =
    decode(
      raw,
      key
    );

  if (!session) {
    return {
      status: "invalid"
    };
  }

  const expiresAt =
    Date.parse(
      session.expiresAt
    );

  if (
    !Number.isFinite(
      expiresAt
    ) ||
    expiresAt <= Date.now()
  ) {
    return {
      status: "expired"
    };
  }

  return {
    status: "ok",
    session
  };
}

export function setPersonaServerSessionCookie(
  response: NextResponse,
  session: PersonaSession,
  secure: boolean
): boolean {
  const key =
    secret();

  if (!key) {
    return false;
  }

  response.cookies.set(
    PERSONA_SESSION_COOKIE_NAME,
    encode(
      session,
      key
    ),
    {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge:
        Math.floor(
          SESSION_TTL_MS /
          1000
        )
    }
  );

  return true;
}

export function clearPersonaServerSessionCookie(
  response: NextResponse,
  secure: boolean
): void {
  response.cookies.set(
    PERSONA_SESSION_COOKIE_NAME,
    "",
    {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 0
    }
  );
}
