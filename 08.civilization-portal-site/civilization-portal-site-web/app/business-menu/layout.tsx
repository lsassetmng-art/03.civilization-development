import type { ReactNode } from "react";
import { requireCivilizationIdentityForPublicMenu } from "../../lib/auth/portal-menu-identity-guard";

export const dynamic = "force-dynamic";

export default async function BusinessMenuLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  await requireCivilizationIdentityForPublicMenu("business");
  return children;
}
