import {
  createLifeOSCivilizationLoginContext,
} from "../../lib/lifeos-civilization-login-context";
import {
  createLifeOSMenuViewModel,
} from "../../lib/lifeos-menu-contract";

type SearchParams = Record<string, string | string[] | undefined>;

type LifeOSPageProps = {
  readonly searchParams?: Promise<SearchParams>;
};

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Fail-closed LifeOS entry.
 * URL identity fields are never authorization evidence.
 * Replace this guard only when the server-verified LifeOS session
 * contract and atomic one-time handoff exchange are implemented.
 */
export default async function LifeOSPage({ searchParams }: LifeOSPageProps) {
  const params = searchParams ? await searchParams : {};
  const context = createLifeOSCivilizationLoginContext({
    localeCode: firstSearchParam(params.localeCode ?? params.locale_code ?? params.locale),
  });
  const menu = createLifeOSMenuViewModel({
    languageCode: context.languageCode,
    localeCode: context.localeCode,
  });

  return (
    <main
      data-testid="lifeos-auth-required"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#f7f3ea",
        color: "#1f2723",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <section
        role="status"
        style={{
          width: "100%",
          maxWidth: "560px",
          padding: "28px",
          borderRadius: "20px",
          background: "#fff",
          border: "1px solid #d8d4ca",
        }}
      >
        <h1 style={{ marginTop: 0 }}>{menu.strings.appTitle}</h1>
        <h2>{context.languageCode === "en" ? "Sign-in required" : "ログインが必要です"}</h2>
        <p>
          {context.languageCode === "en"
            ? "LifeOS requires a verified CivilizationOS session."
            : "LifeOSの利用にはCivilizationOSで確認された認証セッションが必要です。"}
        </p>
        <a href="/login?requestedOsCode=civilization">
          {context.languageCode === "en" ? "Go to sign-in" : "ログイン画面へ"}
        </a>
      </section>
    </main>
  );
}
