import {
  scryptSync,
  timingSafeEqual
} from "crypto";

import {
  testLoginDisplayName,
  testLoginId
} from "@/lib/civilization-login-accounts";

const ENABLE_ENV =
  "CIVILIZATION_TEST_LOGIN_ENABLED";

const CREDENTIAL_ENV =
  "CIVILIZATION_TEST_LOGIN_PASSWORD_SCRYPT";

const INTERNAL_TEST_CIVILIZATION_ID =
  "00000000-0000-4000-8000-000000000001";

const CREDENTIAL_FORMAT =
  "scrypt-v1";

const EXPECTED_DIGEST_BYTES =
  32;

const MIN_SALT_BYTES =
  16;

const MAX_SALT_BYTES =
  64;

const MAX_PASSWORD_LENGTH =
  1024;

type ParsedCredential = {
  salt: Buffer;
  digest: Buffer;
};

export type CivilizationTestLoginVerification =
  | {
      status: "ok";
      civilizationId: string;
      displayName: string;
    }
  | {
      status:
        | "disabled"
        | "not_configured"
        | "invalid";
    };

function testLoginEnabled(): boolean {
  return (
    process.env[ENABLE_ENV]
      ?.trim()
      .toLowerCase() ===
    "true"
  );
}

function validBase64Url(
  value: string
): boolean {
  return (
    value.length > 0 &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}

function parseCredential(
  value: string | undefined
): ParsedCredential | null {
  if (
    typeof value !== "string" ||
    value.length === 0
  ) {
    return null;
  }

  const parts =
    value.split("$");

  if (
    parts.length !== 3 ||
    parts[0] !== CREDENTIAL_FORMAT ||
    !validBase64Url(parts[1]) ||
    !validBase64Url(parts[2])
  ) {
    return null;
  }

  let salt: Buffer;
  let digest: Buffer;

  try {
    salt =
      Buffer.from(
        parts[1],
        "base64url"
      );

    digest =
      Buffer.from(
        parts[2],
        "base64url"
      );
  } catch {
    return null;
  }

  if (
    salt.length < MIN_SALT_BYTES ||
    salt.length > MAX_SALT_BYTES ||
    digest.length !==
      EXPECTED_DIGEST_BYTES
  ) {
    return null;
  }

  return {
    salt,
    digest
  };
}

function verifyPassword(
  password: string,
  credential: ParsedCredential
): boolean {
  if (
    password.length === 0 ||
    password.length >
      MAX_PASSWORD_LENGTH
  ) {
    return false;
  }

  try {
    const candidate =
      scryptSync(
        password,
        credential.salt,
        credential.digest.length
      );

    return (
      candidate.length ===
        credential.digest.length &&
      timingSafeEqual(
        candidate,
        credential.digest
      )
    );
  } catch {
    return false;
  }
}

export function verifyCivilizationTestLogin(
  input: {
    loginIdentifier: string;
    password: string;
  }
): CivilizationTestLoginVerification {
  if (!testLoginEnabled()) {
    return {
      status: "disabled"
    };
  }

  const credential =
    parseCredential(
      process.env[
        CREDENTIAL_ENV
      ]
    );

  if (!credential) {
    return {
      status: "not_configured"
    };
  }

  const normalizedLoginId =
    input.loginIdentifier
      .trim()
      .toLowerCase();

  const passwordMatches =
    verifyPassword(
      input.password,
      credential
    );

  const loginIdMatches =
    normalizedLoginId ===
    testLoginId();

  if (
    !loginIdMatches ||
    !passwordMatches
  ) {
    return {
      status: "invalid"
    };
  }

  return {
    status: "ok",
    civilizationId:
      INTERNAL_TEST_CIVILIZATION_ID,
    displayName:
      testLoginDisplayName()
  };
}
