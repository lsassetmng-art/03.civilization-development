import { getAdminClient } from "../common/db.ts";

export async function registerPublishRequest(input: {
  publish_ref: string;
  request_channel: "publish_now" | "schedule";
  execute_after?: string | null;
  idempotency_key?: string | null;
}) {
  const db = getAdminClient();
  const { data, error } = await db.rpc("fn_stream_studio_register_publish_request", {
    p_publish_ref: input.publish_ref,
    p_request_channel: input.request_channel,
    p_execute_after: input.execute_after ?? null,
    p_idempotency_key: input.idempotency_key ?? null
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function listPublishHistory(limit = 20) {
  const db = getAdminClient();
  const { data, error } = await db
    .from("v_stream_studio_publish_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
