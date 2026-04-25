import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { assertCondition } from "./errors.ts";

let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (cached) return cached;

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  assertCondition(url, "MISSING_SUPABASE_URL", "SUPABASE_URL is required", 500);
  assertCondition(key, "MISSING_SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE_KEY is required", 500);

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return cached;
}
