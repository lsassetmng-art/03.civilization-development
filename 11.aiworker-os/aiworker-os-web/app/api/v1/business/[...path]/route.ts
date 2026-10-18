import {
  readAiWorkerServerSession
} from "../../../../../lib/auth/aiworker-server-session";

import {
  NextRequest
} from "next/server";

const ROBOT_RENTAL_API_ORIGIN =
  "http://127.0.0.1:9020";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type RouteContext = {
  params:
    Promise<{
      path: string[];
    }>;
};

const POST_PATHS =
  new Set([
    "robot-rental/quote/persist",
    "robot-rental/contracts/confirm",
    "robot-rental/payments/intent/create",
    "robot-rental/rentals/start",
    "robot-rental/rentals/end",
    "robot-rental/rentals/cancel"
  ]);

function isAllowed(
  method: string,
  businessPath: string
): boolean {
  if (method === "GET") {
    return (
      businessPath ===
        "robot-rental/catalog" ||
      businessPath ===
        "robot-rental/contracts" ||
      /^robot-rental\/contracts\/[^/]+$/
        .test(businessPath) ||
      businessPath ===
        "application-contracts" ||
      /^application-contracts\/[^/]+$/
        .test(businessPath)
    );
  }

  if (method === "POST") {
    return POST_PATHS.has(
      businessPath
    );
  }

  return false;
}

function upstreamHeaders(
  request: NextRequest
): Headers {
  const headers =
    new Headers();

  const contentType =
    request.headers.get(
      "content-type"
    );

  if (contentType) {
    headers.set(
      "content-type",
      contentType
    );
  }

  return headers;
}

async function proxyBusinessApi(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const {
    path
  } =
    await context.params;

  const businessPath =
    path.join("/");

  if (
    !isAllowed(
      request.method,
      businessPath
    )
  ) {
    return Response.json(
      {
        ok: false,
        error:
          "business_api_route_not_allowed"
      },
      {
        status: 404
      }
    );
  }

  const publicCatalog =
    request.method === "GET" &&
    businessPath ===
      "robot-rental/catalog";

  if (!publicCatalog) {
    const session =
      readAiWorkerServerSession(
        request
      );

    if (
      session.status !==
        "ok"
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "unauthenticated"
        },
        {
          status: 401,
          headers: {
            "cache-control":
              "no-store"
          }
        }
      );
    }

    /*
     * Authentication does not prove BusinessOS ownership.
     *
     * No canonical server_session_actor_key ->
     * owner_civilization_id binding exists yet.
     *
     * UUID syntax alone is explicitly insufficient.
     */
    return Response.json(
      {
        ok: false,
        error:
          "civilization_identity_not_bound"
      },
      {
        status: 403,
        headers: {
          "cache-control":
            "no-store"
        }
      }
    );
  }

  const encodedPath =
    path
      .map(
        (segment) =>
          encodeURIComponent(
            segment
          )
      )
      .join("/");

  const incoming =
    new URL(
      request.url
    );

  const upstream =
    new URL(
      "/api/v1/business/" +
        encodedPath,
      ROBOT_RENTAL_API_ORIGIN
    );

  upstream.search =
    incoming.search;

  try {
    const result =
      await fetch(
        upstream,
        {
          method:
            request.method,
          headers:
            upstreamHeaders(
              request
            ),
          cache:
            "no-store"
        }
      );

    const headers =
      new Headers();

    const contentType =
      result.headers.get(
        "content-type"
      );

    if (contentType) {
      headers.set(
        "content-type",
        contentType
      );
    }

    headers.set(
      "cache-control",
      "no-store"
    );

    return new Response(
      await result.arrayBuffer(),
      {
        status:
          result.status,
        headers
      }
    );
  } catch {
    return Response.json(
      {
        ok: false,
        error:
          "robot_rental_backend_unavailable"
      },
      {
        status: 502,
        headers: {
          "cache-control":
            "no-store"
        }
      }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  return proxyBusinessApi(
    request,
    context
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  return proxyBusinessApi(
    request,
    context
  );
}
