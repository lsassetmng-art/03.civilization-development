import Link from "next/link";
import { notFound } from "next/navigation";
import { MenuShell } from "../../components/menu-shell";
import { MENU, menuItem, resolveLocale } from "../../lib/menu";

export function generateStaticParams() {
  return MENU.map((item) => ({ section: item.key }));
}

export default async function Section({ params, searchParams }: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const item = menuItem((await params).section);
  if (!item) notFound();
  const locale = resolveLocale((await searchParams).lang);
  const exhibition = item.key === "virtual_exhibitions";
  return (
    <MenuShell locale={locale} active={item.key}>
      <section className="panel" aria-labelledby="section-title">
        <p className="eyebrow">StaticArtOS / {locale === "ja" ? "メニュー" : "Menu"}</p>
        <h1 id="section-title">{locale === "ja" ? item.ja : item.en}</h1>
        <div className="notice" role="status">
          <h2>{locale === "ja" ? "現在利用できません" : "Currently unavailable"}</h2>
          <p>{exhibition
            ? locale === "ja"
              ? "個展の作成は CivilizationOS の展示ビルダーが担当します。認証済み利用者の引き継ぎが利用可能になるまで、ここからの作成は開始できません。"
              : "CivilizationOS owns exhibition creation. This entry cannot start a draft until the authenticated handoff is available."
            : locale === "ja"
              ? "この画面の業務機能はまだ利用できません。"
              : "This section is not available yet."}</p>
        </div>
        <Link className="back" href={`/?lang=${locale}`}>{locale === "ja" ? "メニューに戻る" : "Back to menu"}</Link>
      </section>
    </MenuShell>
  );
}
