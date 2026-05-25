import type { SupportedLocale } from "@/types/locale";

export const defaultLocale: SupportedLocale = "ja";

type TranslationKey =
  | "app.title"
  | "nav.signup"
  | "nav.login"
  | "nav.globalMap"
  | "auth.signup.title"
  | "auth.signup.description"
  | "auth.login.title"
  | "auth.login.description"
  | "auth.displayName"
  | "auth.loginIdentifier"
  | "auth.password"
  | "auth.terms"
  | "auth.privacy"
  | "auth.createAccount"
  | "auth.loginAction"
  | "auth.contractNotice"
  | "map.global.title"
  | "map.global.description"
  | "map.continent.title"
  | "map.continent.description"
  | "map.city.title"
  | "map.city.description"
  | "handoff.title"
  | "handoff.requestedOs"
  | "handoff.returnTarget"
  | "handoff.languageCode"
  | "common.next";

const dictionaries: Record<SupportedLocale, Record<TranslationKey, string>> = {
  ja: {
    "app.title": "Operating System of Civilization",
    "nav.signup": "新規登録",
    "nav.login": "ログイン",
    "nav.globalMap": "全大陸マップ",
    "auth.signup.title": "CivilizationOS 新規登録",
    "auth.signup.description": "Civilization IDを作成します。表示言語の設定はPortal Site側で行います。",
    "auth.login.title": "CivilizationOS ログイン",
    "auth.login.description": "Portalまたは他OSからの利用でも、認証はCivilizationOSで行います。",
    "auth.displayName": "表示名",
    "auth.loginIdentifier": "ログインID",
    "auth.password": "パスワード",
    "auth.terms": "利用規約に同意",
    "auth.privacy": "プライバシーポリシーに同意",
    "auth.createAccount": "アカウント作成",
    "auth.loginAction": "ログイン",
    "auth.contractNotice": "この画面はCivilizationOS認証正本のUI/契約です。DB永続化はDB設計GO後に接続します。",
    "map.global.title": "全大陸マップ",
    "map.global.description": "ログイン後に最初に表示される、全大陸の入口です。",
    "map.continent.title": "各大陸マップ",
    "map.continent.description": "選択した大陸の全体を表示します。",
    "map.city.title": "大陸内マップ",
    "map.city.description": "都市、地区、施設、Builder入口へ進む詳細階層です。",
    "handoff.title": "認証後復帰情報",
    "handoff.requestedOs": "要求元OS",
    "handoff.returnTarget": "復帰先",
    "handoff.languageCode": "Portal表示言語",
    "common.next": "次へ"
  },
  en: {
    "app.title": "Operating System of Civilization",
    "nav.signup": "Sign up",
    "nav.login": "Login",
    "nav.globalMap": "Global Map",
    "auth.signup.title": "CivilizationOS Sign up",
    "auth.signup.description": "Create a Civilization ID. Language settings are owned by Portal Site.",
    "auth.login.title": "CivilizationOS Login",
    "auth.login.description": "Authentication is handled by CivilizationOS, including Portal and other OS entry.",
    "auth.displayName": "Display name",
    "auth.loginIdentifier": "Login ID",
    "auth.password": "Password",
    "auth.terms": "Accept terms",
    "auth.privacy": "Accept privacy policy",
    "auth.createAccount": "Create account",
    "auth.loginAction": "Login",
    "auth.contractNotice": "This screen defines the CivilizationOS authentication UI and contract. DB persistence will be connected after DB design approval.",
    "map.global.title": "Global Map",
    "map.global.description": "The first CivilizationOS map after login, showing all continents.",
    "map.continent.title": "Continent Map",
    "map.continent.description": "Shows the selected continent.",
    "map.city.title": "City Map",
    "map.city.description": "Detailed layer for cities, districts, facilities, and Builder routes.",
    "handoff.title": "Authentication return context",
    "handoff.requestedOs": "Requested OS",
    "handoff.returnTarget": "Return target",
    "handoff.languageCode": "Portal language",
    "common.next": "Next"
  }
};

export function normalizeLocale(value: string | null | undefined): SupportedLocale {
  if (value === "en" || value === "ja") return value;
  return defaultLocale;
}

export function t(locale: SupportedLocale, key: TranslationKey): string {
  return dictionaries[locale][key] ?? dictionaries[defaultLocale][key];
}
