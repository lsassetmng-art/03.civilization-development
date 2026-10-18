import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual
} from "crypto";

const HANDOFF_TTL_MS =
  120 * 1000;

const MAX_CLOCK_SKEW_MS =
  30 * 1000;

const AUDIENCE =
  "aiworker";

const PURPOSE =
  "aiworker_auth_handoff";

const AAD =
  Buffer.from(
    "civilization-aiworker-auth-handoff-v1",
    "utf8"
  );

const BASE64URL =
  /^[A-Za-z0-9_-]+$/;

type HandoffPayload = {
  version: 1;
  purpose: "aiworker_auth_handoff";
  audienceOsCode: "aiworker";
  serverSessionActorKey: string;
  stateHash: string;
  codeChallenge: string;
  codeChallengeMethod: "S256";
  nonce: string;
  issuedAtMs: number;
  expiresAtMs: number;
};

export type AiWorkerHandoffIssueResult =
  | {
      status: "ok";
      redirectTarget: string;
    }
  | {
      status:
        | "invalid_request"
        | "not_configured"
        | "unavailable";
    };

export type AiWorkerHandoffExchangeResult =
  | {
      status: "ok";
      serverSessionActorKey: string;
    }
  | {
      status:
        | "invalid_request"
        | "invalid"
        | "not_configured"
        | "unavailable";
    };

function sealKey():
  Buffer |
  null {
  const raw =
    process.env
      .CIVILIZATION_AUTH_HANDOFF_SEAL_KEY
      ?.trim();

  if (
    !raw ||
    !BASE64URL.test(raw)
  ) {
    return null;
  }

  try {
    const key =
      Buffer.from(
        raw,
        "base64url"
      );

    return key.length === 32
      ? key
      : null;
  } catch {
    return null;
  }
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

function validOpaque(
  value: unknown,
  min: number,
  max: number
): value is string {
  return (
    typeof value === "string" &&
    value.length >= min &&
    value.length <= max &&
    BASE64URL.test(value)
  );
}

function hashBase64Url(
  value: string
): string {
  return createHash("sha256")
    .update(value, "utf8")
    .digest("base64url");
}

function safeEqual(
  left: string,
  right: string
): boolean {
  try {
    const a =
      Buffer.from(left, "utf8");

    const b =
      Buffer.from(right, "utf8");

    return (
      a.length === b.length &&
      timingSafeEqual(a, b)
    );
  } catch {
    return false;
  }
}

function aiWorkerCallback():
  string |
  null {
  const raw =
    process.env
      .AIWORKEROS_PUBLIC_BASE_URL
      ?.trim();

  if (!raw) {
    return null;
  }

  try {
    const base =
      new URL(raw);

    const allowed =
      base.protocol === "https:" ||
      (
        base.protocol === "http:" &&
        (
          base.hostname === "localhost" ||
          base.hostname === "127.0.0.1" ||
          base.hostname === "[::1]"
        )
      );

    if (
      !allowed ||
      base.username ||
      base.password
    ) {
      return null;
    }

    return new URL(
      "/api/civilization/auth/callback",
      base.origin
    ).toString();
  } catch {
    return null;
  }
}

function seal(
  payload: HandoffPayload,
  key: Buffer
): string {
  const iv =
    randomBytes(12);

  const cipher =
    createCipheriv(
      "aes-256-gcm",
      key,
      iv
    );

  cipher.setAAD(AAD);

  const plaintext =
    Buffer.from(
      JSON.stringify(payload),
      "utf8"
    );

  const ciphertext =
    Buffer.concat([
      cipher.update(plaintext),
      cipher.final()
    ]);

  const tag =
    cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    ciphertext.toString("base64url"),
    tag.toString("base64url")
  ].join(".");
}

function unseal(
  code: unknown,
  key: Buffer
): HandoffPayload |
  null {
  if (
    typeof code !== "string" ||
    code.length < 64 ||
    code.length > 4096
  ) {
    return null;
  }

  const parts =
    code.split(".");

  if (
    parts.length !== 4 ||
    parts[0] !== "v1" ||
    !parts[1] ||
    !parts[2] ||
    !parts[3]
  ) {
    return null;
  }

  if (
    !BASE64URL.test(parts[1]) ||
    !BASE64URL.test(parts[2]) ||
    !BASE64URL.test(parts[3])
  ) {
    return null;
  }

  try {
    const iv =
      Buffer.from(
        parts[1],
        "base64url"
      );

    const ciphertext =
      Buffer.from(
        parts[2],
        "base64url"
      );

    const tag =
      Buffer.from(
        parts[3],
        "base64url"
      );

    if (
      iv.length !== 12 ||
      tag.length !== 16
    ) {
      return null;
    }

    const decipher =
      createDecipheriv(
        "aes-256-gcm",
        key,
        iv
      );

    decipher.setAAD(AAD);
    decipher.setAuthTag(tag);

    const plaintext =
      Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
      ]);

    const parsed =
      JSON.parse(
        plaintext.toString("utf8")
      ) as Partial<HandoffPayload>;

    if (
      parsed.version !== 1 ||
      parsed.purpose !== PURPOSE ||
      parsed.audienceOsCode !== AUDIENCE ||
      !validActor(parsed.serverSessionActorKey) ||
      typeof parsed.stateHash !== "string" ||
      !validOpaque(parsed.codeChallenge, 43, 43) ||
      parsed.codeChallengeMethod !== "S256" ||
      !validOpaque(parsed.nonce, 32, 128) ||
      !Number.isSafeInteger(parsed.issuedAtMs) ||
      !Number.isSafeInteger(parsed.expiresAtMs)
    ) {
      return null;
    }

    return parsed as HandoffPayload;
  } catch {
    return null;
  }
}

export async function issueAiWorkerHandoff(
  input: {
    serverSessionActorKey: string;
    state: unknown;
    codeChallenge: unknown;
    codeChallengeMethod: unknown;
  }
): Promise<AiWorkerHandoffIssueResult> {
  const key =
    sealKey();

  const callback =
    aiWorkerCallback();

  if (
    !key ||
    !callback
  ) {
    return {
      status: "not_configured"
    };
  }

  if (
    !validActor(
      input.serverSessionActorKey
    ) ||
    !validOpaque(
      input.state,
      43,
      128
    ) ||
    !validOpaque(
      input.codeChallenge,
      43,
      43
    ) ||
    input.codeChallengeMethod !==
      "S256"
  ) {
    return {
      status: "invalid_request"
    };
  }

  const issuedAtMs =
    Date.now();

  const payload:
    HandoffPayload = {
      version: 1,
      purpose:
        PURPOSE,
      audienceOsCode:
        AUDIENCE,
      serverSessionActorKey:
        input.serverSessionActorKey,
      stateHash:
        hashBase64Url(
          input.state
        ),
      codeChallenge:
        input.codeChallenge,
      codeChallengeMethod:
        "S256",
      nonce:
        randomBytes(24)
          .toString("base64url"),
      issuedAtMs,
      expiresAtMs:
        issuedAtMs +
        HANDOFF_TTL_MS
    };

  try {
    const code =
      seal(
        payload,
        key
      );

    const target =
      new URL(callback);

    target.searchParams.set(
      "code",
      code
    );

    target.searchParams.set(
      "state",
      input.state
    );

    return {
      status: "ok",
      redirectTarget:
        target.toString()
    };
  } catch {
    return {
      status: "unavailable"
    };
  }
}

export async function exchangeAiWorkerHandoff(
  input: {
    code: unknown;
    state: unknown;
    codeVerifier: unknown;
  }
): Promise<AiWorkerHandoffExchangeResult> {
  const key =
    sealKey();

  if (!key) {
    return {
      status: "not_configured"
    };
  }

  if (
    !validOpaque(
      input.state,
      43,
      128
    ) ||
    !validOpaque(
      input.codeVerifier,
      43,
      128
    )
  ) {
    return {
      status: "invalid_request"
    };
  }

  const payload =
    unseal(
      input.code,
      key
    );

  if (!payload) {
    return {
      status: "invalid"
    };
  }

  const now =
    Date.now();

  if (
    payload.issuedAtMs >
      now + MAX_CLOCK_SKEW_MS ||
    payload.expiresAtMs <=
      now ||
    payload.expiresAtMs <=
      payload.issuedAtMs ||
    payload.expiresAtMs -
      payload.issuedAtMs >
      HANDOFF_TTL_MS
  ) {
    return {
      status: "invalid"
    };
  }

  const expectedStateHash =
    hashBase64Url(
      input.state
    );

  if (
    !safeEqual(
      payload.stateHash,
      expectedStateHash
    )
  ) {
    return {
      status: "invalid"
    };
  }

  const expectedChallenge =
    hashBase64Url(
      input.codeVerifier
    );

  if (
    !safeEqual(
      payload.codeChallenge,
      expectedChallenge
    )
  ) {
    return {
      status: "invalid"
    };
  }

  return {
    status: "ok",
    serverSessionActorKey:
      payload.serverSessionActorKey
  };
}
