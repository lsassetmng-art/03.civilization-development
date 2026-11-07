import { readSession } from "../../lib/lifeos-server-auth";
import { createLifeOSCivilizationLoginContext } from "../../lib/lifeos-civilization-login-context";
import { createLifeOSMenuViewModel } from "../../lib/lifeos-menu-contract";
export const dynamic = "force-dynamic";
type SearchParams = Record<string, string | string[] | undefined>;
type LifeOSPageProps = { readonly searchParams?: Promise<SearchParams> };
function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
export default async function LifeOSPage({ searchParams }: LifeOSPageProps) {
  const params = searchParams ? await searchParams : {};
  const context = createLifeOSCivilizationLoginContext({ localeCode: first(params.localeCode ?? params.locale_code ?? params.locale) });
  const menu = createLifeOSMenuViewModel({ languageCode: context.languageCode, localeCode: context.localeCode });
  const civilizationId = await readSession();
  return <main data-testid={civilizationId ? "lifeos-authenticated" : "lifeos-auth-required"} style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f7f3ea", color: "#1f2723", fontFamily: "system-ui, sans-serif" }}>
    <section role="status" style={{ width: "100%", maxWidth: 560, padding: 28, borderRadius: 20, background: "#fff", border: "1px solid #d8d4ca" }}>
      <h1>{menu.strings.appTitle}</h1>
      {civilizationId ? <><h2>LifeOS</h2><p>認証済みセッションを確認しました。</p><form action="/api/lifeos/auth/logout" method="post"><button type="submit">ログアウト</button></form></> : <><h2>{context.languageCode === "en" ? "Sign-in required" : "ログインが必要です"}</h2><p>{context.languageCode === "en" ? "LifeOS requires a verified CivilizationOS session." : "LifeOSの利用にはCivilizationOSで確認された認証セッションが必要です。"}</p><a href="/api/lifeos/auth/start">{context.languageCode === "en" ? "Go to sign-in" : "ログイン画面へ"}</a></>}
    </section>
  </main>;
}
