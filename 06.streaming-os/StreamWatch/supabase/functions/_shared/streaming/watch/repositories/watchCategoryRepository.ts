import { getAdminClient } from "../common/db.ts";

const db = () => getAdminClient().schema("streaming");

export async function listCategoryNodes(root_key: string) {
  const { data, error } = await db()
    .from("category_tree_nodes")
    .select("*")
    .eq("root_key", root_key)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
