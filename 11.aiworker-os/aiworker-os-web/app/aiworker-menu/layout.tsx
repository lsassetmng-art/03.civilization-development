import {
  cookies
} from "next/headers";

import {
  redirect
} from "next/navigation";

import {
  readAiWorkerServerSession
} from "../../lib/auth/aiworker-server-session";

export const dynamic =
  "force-dynamic";

export default async function AiWorkerMenuLayout(
  {
    children
  }: Readonly<{
    children:
      React.ReactNode;
  }>
) {
  const cookieStore =
    await cookies();

  const session =
    readAiWorkerServerSession(
      {
        cookies: {
          get:
            (name: string) =>
              cookieStore.get(name)
        }
      }
    );

  if (
    session.status !==
      "ok"
  ) {
    redirect(
      "/api/civilization/auth/start?return_to=%2Faiworker-menu"
    );
  }

  return children;
}
