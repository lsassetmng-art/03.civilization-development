import Link from "next/link";
import { MENU, menuHref, type Locale, type MenuKey } from "../lib/menu";

export function MenuShell({ locale, active, children }: {
  locale: Locale;
  active?: MenuKey;
  children: React.ReactNode;
}) {
  return (
    <div className="shell">
      <a href="#content" className="skip">{locale === "ja" ? "本文へ移動" : "Skip to content"}</a>
      <header className="header">
        <Link className="brand" href={`/?lang=${locale}`}>StaticArtOS</Link>
        <div className="languages" aria-label={locale === "ja" ? "表示言語" : "Language"}>
          <Link href={active ? menuHref(active, "ja") : "/?lang=ja"} lang="ja" aria-current={locale === "ja" ? "page" : undefined}>日本語</Link>
          <Link href={active ? menuHref(active, "en") : "/?lang=en"} lang="en" aria-current={locale === "en" ? "page" : undefined}>English</Link>
        </div>
      </header>
      <nav className="navigation" aria-label={locale === "ja" ? "StaticArtOS メインメニュー" : "StaticArtOS main menu"}>
        {MENU.map((item) => (
          <Link key={item.key} href={menuHref(item.key, locale)} aria-current={active === item.key ? "page" : undefined}>
            {locale === "ja" ? item.ja : item.en}
          </Link>
        ))}
      </nav>
      <main id="content">{children}</main>
    </div>
  );
}
