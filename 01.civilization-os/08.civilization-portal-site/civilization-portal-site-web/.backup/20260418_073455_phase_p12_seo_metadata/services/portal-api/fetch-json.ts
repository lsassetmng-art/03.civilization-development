import type { PortalErrorResponse } from "../../types/portal-api";

export class PortalApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type FetchJsonOptions<TBody> = {
  method?: "GET" | "POST";
  body?: TBody;
};

export const fetchJson = async <TBody, TResponse>(
  url: string,
  options: FetchJsonOptions<TBody> = {},
): Promise<TResponse> => {
  const response = await fetch(url, {
    method: options.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json()) as TResponse | PortalErrorResponse;

  if (!response.ok) {
    const errorPayload = payload as PortalErrorResponse;
    throw new PortalApiError(
      response.status,
      errorPayload.error?.code ?? "PORTAL_HTTP_ERROR",
      errorPayload.error?.message ?? "Request failed.",
    );
  }

  return payload as TResponse;
};
