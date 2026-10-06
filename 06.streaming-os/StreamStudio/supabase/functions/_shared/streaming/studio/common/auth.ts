import {
  createClient,
  type SupabaseClient,
} from "npm:@supabase/supabase-js@2";

import { DomainError } from "./errors.ts";

export type StreamingAuthContext = {
  authUserId: string;
  civilizationId: string;
  client: SupabaseClient;
};

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new DomainError(
      "internal_error",
      `${name} is required`,
      500,
    );
  }

  return value;
}

function readBearerToken(req: Request): string {
  const header =
    req.headers.get("authorization")?.trim() ?? "";

  const match =
    /^Bearer\s+(.+)$/i.exec(header);

  if (!match?.[1]?.trim()) {
    throw new DomainError(
      "unauthorized_actor",
      "Authorization bearer token is required",
      401,
    );
  }

  return match[1].trim();
}

function createRequestClient(
  accessToken: string,
): SupabaseClient {
  return createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_ANON_KEY"),
    {
      global: {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

export async function requireStreamingActor(
  req: Request,
  actorCivilizationId: string,
): Promise<StreamingAuthContext> {
  const accessToken =
    readBearerToken(req);

  const client =
    createRequestClient(accessToken);

  const {
    data: userData,
    error: userError,
  } = await client.auth.getUser(
    accessToken,
  );

  if (
    userError ||
    !userData.user
  ) {
    throw new DomainError(
      "unauthorized_actor",
      "Actor identity is missing or invalid for this endpoint",
      401,
    );
  }

  const {
    data: civilizationId,
    error: civilizationError,
  } = await client
    .schema("streaming")
    .rpc("current_civilization_id");

  if (
    civilizationError ||
    typeof civilizationId !== "string" ||
    civilizationId.length === 0
  ) {
    throw new DomainError(
      "unauthorized_actor",
      "Civilization identity binding is missing or invalid",
      401,
    );
  }

  if (
    civilizationId !==
    actorCivilizationId
  ) {
    throw new DomainError(
      "unauthorized_actor",
      "actor_civilization_id does not match the authenticated actor",
      401,
    );
  }

  return {
    authUserId: userData.user.id,
    civilizationId,
    client,
  };
}
