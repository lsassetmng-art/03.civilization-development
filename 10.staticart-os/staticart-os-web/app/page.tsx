import { MenuShell } from "../components/menu-shell";
import { resolveLocale } from "../lib/menu";

export default async function Home({ searchParams }: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = resolveLocale((await searchParams).lang);
  return (
    <MenuShell locale={locale}>
      <section className="panel">
        <p className="eyebrow">StaticArtOS</p>
        <h1>{locale === "ja" ? "メニュー" : "Menu"}</h1>
        <p>{locale === "ja" ? "利用する項目をメニューから選択してください。" : "Choose a destination from the menu."}</p>
      </section>
    </MenuShell>
  );
}
