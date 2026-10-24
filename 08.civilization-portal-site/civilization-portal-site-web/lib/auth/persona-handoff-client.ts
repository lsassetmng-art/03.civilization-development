type ExchangeInput = {
  code: string;
  state: string;
  codeVerifier: string;
};

export type PersonaHandoffExchangeResult =
  | {
      status: "ok";
      serverSessionActorKey: string;
    }
  | {
      status:
        | "invalid"
        | "unavailable";
    };

function civilizationOrigin():
  string |
  null {
  const raw =
    process.env
      .CIVILIZATION_OS_PUBLIC_BASE_URL
      ?.trim();

  if (!raw) {
    return null;
  }

  try {
    const url =
      new URL(raw);

    const valid =
      url.protocol === "https:" ||
      (
        url.protocol === "http:" &&
        (
          url.hostname === "localhost" ||
          url.hostname === "127.0.0.1" ||
          url.hostname === "[::1]"
        )
      );

    if (
      !valid ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export async function exchangePersonaHandoff(
  input: ExchangeInput
): Promise<PersonaHandoffExchangeResult> {
  const origin =
    civilizationOrigin();

  if (!origin) {
    return {
      status:
        "unavailable"
    };
  }

  const endpoint =
    new URL(
      "/api/civilization/auth/handoff/persona-exchange",
      origin
    );

  try {
    const response =
      await fetch(
        endpoint,
        {
          method: "POST",
          headers: {
            accept:
              "application/json",
            "content-type":
              "application/json"
          },
          body:
            JSON.stringify(
              {
                code:
                  input.code,
                state:
                  input.state,
                code_verifier:
                  input.codeVerifier
              }
            ),
          cache:
            "no-store"
        }
      );

    const payload =
      await response
        .json()
        .catch(
          () => null
        ) as
          | {
              server_session_actor_key?:
                unknown;
            }
          | null;

    if (
      response.status === 401 ||
      response.status === 400
    ) {
      return {
        status: "invalid"
      };
    }

    if (
      !response.ok ||
      !payload ||
      typeof payload
        .server_session_actor_key !==
        "string" ||
      !payload
        .server_session_actor_key
        .trim()
    ) {
      return {
        status:
          "unavailable"
      };
    }

    return {
      status: "ok",
      serverSessionActorKey:
        payload
          .server_session_actor_key
          .trim()
    };
  } catch {
    return {
      status:
        "unavailable"
    };
  }
}
