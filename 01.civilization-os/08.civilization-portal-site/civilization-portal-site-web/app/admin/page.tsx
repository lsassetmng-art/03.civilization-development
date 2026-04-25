import type { Metadata } from "next";
import AdminWorkspacePage from "../../features/admin/admin-workspace-page";

export const metadata: Metadata = {
  title: "Admin | Civilization Portal Site",
  description: "Operator workspace for portal administration.",
};

export default function Page() {
  return <AdminWorkspacePage />;
}
