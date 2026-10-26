import type { ReactNode } from "react";
import { requireCivilizationIdentityForPublicMenu } from "../../lib/auth/portal-menu-identity-guard";

export const dynamic = "force-dynamic";

export default async function GameMenuLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  await requireCivilizationIdentityForPublicMenu("game");
  return children;
}
