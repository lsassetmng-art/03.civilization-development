import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readPersonaServerSession } from "./persona-server-session";

// R19: shared *identity-only* gate for public, disabled OS menu shells.
// IMPORTANT: never treat this as an app-level permission or grant.
// All actual OS function routes must enforce their own canonical authorization.
const PATHS = {
  streaming: "/streaming-menu",
  business: "/business-menu",
  staticart: "/staticart-menu",
  game: "/game-menu",
  lifeos: "/lifeos"
} as const;

export async function requireCivilizationIdentityForPublicMenu(
  os: keyof typeof PATHS
): Promise<void> {
  const cookieStore = await cookies();
  const result = readPersonaServerSession({
    cookies: { get: (name: string) => cookieStore.get(name) }
  });
  if (result.status !== "ok") {
    redirect(
      "/api/persona/auth/start?return_to=" + encodeURIComponent(PATHS[os])
    );
  }
}
