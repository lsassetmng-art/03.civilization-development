type FetchJsonOptions<Req> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Req;
};

export async function fetchJson<Req, Res>(
  url: string,
  options: FetchJsonOptions<Req>,
): Promise<Res> {
  const response = await fetch(url, {
    method: options.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as Res;
}
