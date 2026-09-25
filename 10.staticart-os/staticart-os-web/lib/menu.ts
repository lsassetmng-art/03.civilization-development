export const MENU = [
  { key: "marketplace", ja: "マーケットプレイス", en: "Marketplace" },
  { key: "virtual_exhibitions", ja: "バーチャル個展", en: "Virtual Exhibitions" },
  { key: "my_library", ja: "マイライブラリ", en: "My Library" },
  { key: "works_management", ja: "作品管理", en: "Works Management" },
  { key: "review_management", ja: "レビュー管理", en: "Review Management" },
] as const;

export type MenuKey = (typeof MENU)[number]["key"];
export type Locale = "ja" | "en";

export function menuItem(key: string) {
  return MENU.find((item) => item.key === key);
}

export function menuHref(key: MenuKey, locale: Locale): string {
  return `/${key}?lang=${locale}`;
}

export function resolveLocale(value: string | undefined): Locale {
  return value === "en" ? "en" : "ja";
}
