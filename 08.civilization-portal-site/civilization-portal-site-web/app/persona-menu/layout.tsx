import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readPersonaServerSession } from "../../lib/auth/persona-server-session";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function PersonaMenuLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const session = readPersonaServerSession({
    cookies: { get: (name: string) => cookieStore.get(name) }
  });
  if (session.status !== "ok") {
    redirect("/api/persona/auth/start?return_to=%2Fpersona-menu");
  }
  return children;
}
