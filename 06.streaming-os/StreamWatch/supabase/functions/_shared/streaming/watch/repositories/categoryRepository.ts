import { getAdminClient } from "../common/db.ts";

type Node = {
  category_node_id: string;
  parent_category_node_id: string | null;
  root_key: string;
  node_key: string;
  display_label: string;
  sort_order: number;
};

function nest(nodes: Node[], parentId: string | null): any[] {
  return nodes
    .filter((node) => node.parent_category_node_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((node) => ({
      category_node_id: node.category_node_id,
      node_key: node.node_key,
      display_label: node.display_label,
      sort_order: node.sort_order,
      children: nest(nodes, node.category_node_id)
    }));
}

export async function readCategoryTree(root_scope: string) {
  const db = getAdminClient();
  const { data, error } = await db
    .from("v_streamwatch_category_tree_active")
    .select("*")
    .eq("root_key", root_scope)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  const nodes = (data ?? []) as Node[];
  return nest(nodes, null);
}
