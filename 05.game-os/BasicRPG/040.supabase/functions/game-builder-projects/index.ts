import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const allowedOrigin = Deno.env.get("GAMEOS_ALLOWED_ORIGIN") ?? "";

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const accepted =
    allowedOrigin && origin === allowedOrigin
      ? allowedOrigin
      : allowedOrigin
        ? ""
        : origin;

  return {
    ...(accepted
      ? { "Access-Control-Allow-Origin": accepted }
      : {}),
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type",
    "Access-Control-Allow-Methods":
      "GET, POST, OPTIONS",
    "Vary": "Origin"
  };
}

function json(
  req: Request,
  payload: unknown,
  status = 200
): Response {
  return new Response(
    JSON.stringify(payload),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...cors(req)
      }
    }
  );
}

function statusForPayload(payload: Record<string, unknown>): number {
  if (!payload.errorCode) {
    return 200;
  }

  if (payload.errorState === "denied") {
    return 403;
  }

  if (payload.errorState === "conflict") {
    return 409;
  }

  return 400;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: cors(req)
    });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return json(req, {
      errorCode: "GAME_BUILDER_SERVER_CONFIGURATION_MISSING",
      errorMessage: "Supabase Builder configuration is missing.",
      errorState: "blocked",
      retryAllowed: false
    }, 503);
  }

  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return json(req, {
      errorCode: "GAME_BUILDER_AUTH_REQUIRED",
      errorMessage: "Authorization header is required.",
      errorState: "denied",
      retryAllowed: false
    }, 401);
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          Authorization: authorization
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );

  const gameos = supabase.schema("gameos");

  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode");
    const projectCode = url.searchParams.get("projectCode");

    if (mode === "bootstrap") {
      const { data, error } = await gameos.rpc(
        "builder_bootstrap"
      );

      if (error) {
        return json(req, {
          errorCode: "GAME_BUILDER_BOOTSTRAP_FAILED",
          errorMessage: error.message,
          errorState: "failed",
          retryAllowed: true
        }, 500);
      }

      return json(req, data);
    }

    if (projectCode) {
      const { data, error } = await gameos.rpc(
        "builder_project_summary",
        {
          p_project_code: projectCode
        }
      );

      if (error) {
        return json(req, {
          errorCode: "GAME_PROJECT_READ_FAILED",
          errorMessage: error.message,
          errorState: "failed",
          retryAllowed: true
        }, 500);
      }

      if (!data) {
        return json(req, {
          errorCode: "GAME_PROJECT_NOT_FOUND",
          errorMessage: "Project was not found or is not visible.",
          errorState: "failed",
          retryAllowed: false
        }, 404);
      }

      return json(req, data);
    }

    return json(req, {
      errorCode: "GAME_BUILDER_READ_REQUEST_INVALID",
      errorMessage: "mode=bootstrap or projectCode is required.",
      errorState: "failed",
      retryAllowed: false
    }, 400);
  }

  if (req.method === "POST") {
    let payload: Record<string, unknown>;

    try {
      payload = await req.json();
    } catch {
      return json(req, {
        errorCode: "GAME_PROJECT_CREATE_REQUEST_INVALID",
        errorMessage: "Request body must be valid JSON.",
        errorState: "failed",
        retryAllowed: false
      }, 400);
    }

    const { data, error } = await gameos.rpc(
      "create_builder_project",
      {
        p_payload: payload
      }
    );

    if (error) {
      return json(req, {
        errorCode: "GAME_PROJECT_CREATE_FAILED",
        errorMessage: error.message,
        errorState: "failed",
        retryAllowed: false
      }, 500);
    }

    const result = data as Record<string, unknown>;

    return json(
      req,
      result,
      statusForPayload(result)
    );
  }

  return json(req, {
    errorCode: "GAME_BUILDER_METHOD_NOT_ALLOWED",
    errorMessage: "Only GET and POST are supported.",
    errorState: "failed",
    retryAllowed: false
  }, 405);
});
