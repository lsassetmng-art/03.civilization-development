const ROBOT_RENTAL_API_ORIGIN = "http://127.0.0.1:9020";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

const POST_PATHS = new Set([
  "robot-rental/quote/persist",
  "robot-rental/contracts/confirm",
  "robot-rental/payments/intent/create",
  "robot-rental/rentals/start",
  "robot-rental/rentals/end",
  "robot-rental/rentals/cancel",
]);

function isAllowed(
  method: string,
  businessPath: string,
): boolean {
  if (method === "GET") {
    if (businessPath === "robot-rental/catalog") {
      return true;
    }

    if (businessPath === "robot-rental/contracts") {
      return true;
    }

    if (
      /^robot-rental\/contracts\/[^/]+$/.test(
        businessPath,
      )
    ) {
      return true;
    }

    if (businessPath === "application-contracts") {
      return true;
    }

    if (
      /^application-contracts\/[^/]+$/.test(
        businessPath,
      )
    ) {
      return true;
    }

    return false;
  }

  if (method === "POST") {
    return POST_PATHS.has(businessPath);
  }

  return false;
}

function createUpstreamHeaders(
  request: Request,
): Headers {
  const headers = new Headers();

  for (const name of [
    "content-type",
    "x-civilization-id",
    "x-owner-civilization-id",
  ]) {
    const value = request.headers.get(name);

    if (value) {
      headers.set(name, value);
    }
  }

  return headers;
}

async function proxyBusinessApi(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { path } = await context.params;

  const businessPath = path.join("/");

  if (!isAllowed(request.method, businessPath)) {
    return Response.json(
      {
        ok: false,
        error: "business_api_route_not_allowed",
      },
      {
        status: 404,
      },
    );
  }

  const encodedPath = path
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const incomingUrl = new URL(request.url);

  const upstreamUrl = new URL(
    `/api/v1/business/${encodedPath}`,
    ROBOT_RENTAL_API_ORIGIN,
  );

  upstreamUrl.search = incomingUrl.search;

  const body =
    request.method === "GET"
      ? undefined
      : await request.arrayBuffer();

  try {
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: createUpstreamHeaders(request),
      body:
        body && body.byteLength > 0
          ? body
          : undefined,
      cache: "no-store",
    });

    const headers = new Headers();

    const contentType =
      upstream.headers.get("content-type");

    if (contentType) {
      headers.set("content-type", contentType);
    }

    return new Response(
      await upstream.arrayBuffer(),
      {
        status: upstream.status,
        headers,
      },
    );
  } catch {
    return Response.json(
      {
        ok: false,
        error: "robot_rental_backend_unavailable",
      },
      {
        status: 502,
      },
    );
  }
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return proxyBusinessApi(request, context);
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return proxyBusinessApi(request, context);
}
