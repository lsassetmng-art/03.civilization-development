import {
  createHmac,
  timingSafeEqual
} from "crypto";

import type {
  NextResponse
} from "next/server";

export const AIWORKER_SESSION_COOKIE_NAME =
  "aiworker_os_server_session_v1";

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

export type AiWorkerSession = {
  version: 1;
  serverSessionActorKey: string;
  issuedAt: string;
  expiresAt: string;
};

export type AiWorkerSessionReadResult =
  | {
      status: "ok";
      session: AiWorkerSession;
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
      .AIWORKER_SESSION_SIGNING_SECRET;

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
  session: AiWorkerSession,
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
): AiWorkerSession |
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
      ) as Partial<AiWorkerSession>;

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
      AiWorkerSession;
  } catch {
    return null;
  }
}

export function aiWorkerServerSessionConfigured():
  boolean {
  return Boolean(secret());
}

export function createAiWorkerServerSession(
  serverSessionActorKey: string
): AiWorkerSession |
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

export function readAiWorkerServerSession(
  source: CookieSource
): AiWorkerSessionReadResult {
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
        AIWORKER_SESSION_COOKIE_NAME
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

export function setAiWorkerServerSessionCookie(
  response: NextResponse,
  session: AiWorkerSession,
  secure: boolean
): boolean {
  const key =
    secret();

  if (!key) {
    return false;
  }

  response.cookies.set(
    AIWORKER_SESSION_COOKIE_NAME,
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

export function clearAiWorkerServerSessionCookie(
  response: NextResponse,
  secure: boolean
): void {
  response.cookies.set(
    AIWORKER_SESSION_COOKIE_NAME,
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
