import {
  DomainError,
  toDomainError,
} from "../common/errors.ts";

import {
  readJson,
  requestId,
} from "../common/http.ts";

import {
  getChannelDetail,
  upsertChannel,
} from "../services/studioChannelService.ts";

const CORS_HEADERS:
  HeadersInit = {
    "access-control-allow-origin":
      "*",

    "access-control-allow-methods":
      "GET,POST,OPTIONS",

    "access-control-allow-headers":
      "authorization,x-client-info,apikey,content-type,x-request-id",
  };

function canonicalPath(
  req: Request,
): string | null {
  const pathname =
    new URL(req.url).pathname;

  const marker =
    "/api/stream-studio";

  const offset =
    pathname.indexOf(marker);

  return offset >= 0
    ? pathname.slice(offset)
    : null;
}

function json(
  body: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(
      body,
      null,
      2,
    ),
    {
      status,
      headers: {
        ...CORS_HEADERS,
        "content-type":
          "application/json; charset=utf-8",
      },
    },
  );
}

function success(
  req: Request,
  data: unknown,
  meta:
    Record<string, unknown> = {},
): Response {
  return json({
    success: true,
    data,
    meta: {
      request_id:
        requestId(req),
      ...meta,
    },
  });
}

function errorTitle(
  code: string,
): string {
  const titles:
    Record<string, string> = {
      invalid_request:
        "Invalid request",

      invalid_field:
        "Invalid field",

      missing_required_field:
        "Required field is missing",

      unsupported_value:
        "Unsupported value",

      unauthorized_actor:
        "Actor is not authorized",

      forbidden_action:
        "Action is not permitted",

      target_not_found:
        "Target was not found",

      state_conflict:
        "State conflict",

      retry_later:
        "Retry later",

      internal_error:
        "Internal error",
    };

  return titles[code] ??
    "Request failed";
}

function canonicalError(
  req: Request,
  error: unknown,
): Response {
  let domain:
    DomainError;

  if (
    error instanceof SyntaxError
  ) {
    domain =
      new DomainError(
        "invalid_request",
        "Request JSON is invalid",
        400,
      );
  } else {
    domain =
      toDomainError(error);
  }

  const code =
    domain.code ===
    "INTERNAL_ERROR"
      ? "internal_error"
      : domain.code;

  const details =
    domain.details &&
    typeof domain.details ===
      "object" &&
    !Array.isArray(
      domain.details,
    )
      ? domain.details as
          Record<
            string,
            unknown
          >
      : null;

  const fieldName =
    typeof details?.field_name ===
      "string"
      ? details.field_name
      : null;

  return json(
    {
      success: false,
      error_code:
        code,

      error_title:
        errorTitle(code),

      error_detail:
        domain.message,

      field_errors:
        fieldName
          ? [
              {
                field_name:
                  fieldName,

                error_code:
                  code,

                error_detail:
                  domain.message,
              },
            ]
          : null,

      request_id:
        requestId(req),

      occurred_at:
        new Date()
          .toISOString(),
    },
    domain.status,
  );
}

export async function tryHandleStudioChannelRoute(
  req: Request,
): Promise<Response | null> {
  const path =
    canonicalPath(req);

  if (!path) {
    return null;
  }

  const isChannelPath =
    path ===
      "/api/stream-studio/channels/upsert" ||
    path.startsWith(
      "/api/stream-studio/channels/",
    );

  if (
    req.method === "OPTIONS" &&
    isChannelPath
  ) {
    return new Response(
      null,
      {
        status: 204,
        headers:
          CORS_HEADERS,
      },
    );
  }

  try {
    const method =
      req.method.toUpperCase();

    const url =
      new URL(req.url);

    const detailMatch =
      /^\/api\/stream-studio\/channels\/([^/]+)$/
        .exec(path);

    if (
      method === "GET" &&
      detailMatch
    ) {
      const data =
        await getChannelDetail(
          req,
          detailMatch[1],
          url.searchParams.get(
            "actor_civilization_id",
          ),
        );

      return success(
        req,
        data,
      );
    }

    if (
      method === "POST" &&
      path ===
        "/api/stream-studio/channels/upsert"
    ) {
      const result =
        await upsertChannel(
          req,
          await readJson(req),
        );

      return success(
        req,
        {
          channel_record_id:
            result.channel_record_id,

          channel_profile_state_id:
            result.channel_profile_state_id,

          channel_status:
            result.channel_status,

          updated_at:
            result.updated_at,
        },
        {
          idempotency_replayed:
            result.idempotency_replayed,

          canonical_result_reference:
            `channel:${result.channel_record_id}`,
        },
      );
    }

    return null;
  } catch (error) {
    return canonicalError(
      req,
      error,
    );
  }
}
