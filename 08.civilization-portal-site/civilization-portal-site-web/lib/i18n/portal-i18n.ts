export type PortalLocaleCode = "ja" | "en";
export type PortalI18nKey = string;
export type PortalI18nDictionary = Record<PortalI18nKey, string>;

export const PORTAL_DEFAULT_LOCALE: PortalLocaleCode = "ja";

export const PORTAL_SUPPORTED_LOCALES: readonly PortalLocaleCode[] = [
  "ja",
  "en",
] as const;

export const PORTAL_I18N_DICTIONARIES: Record<
  PortalLocaleCode,
  PortalI18nDictionary
> = {
  ja: {
    "site.title": "Civilization ポータルサイト",
    "site.subtitle": "Civilizationの公式Web入口",
    "site.description": "Civilizationの公式Web入口です。",

    "nav.home": "ホーム",
    "nav.civilization": "Civilization",
    "nav.osCatalog": "OS一覧",
    "nav.guide": "ガイド",
    "nav.help": "ヘルプ",
    "nav.search": "検索",
    "nav.contact": "お問い合わせ",
    "nav.language": "言語設定",
    "nav.login": "ログイン",
    "nav.signup": "新規登録",
    "nav.launcher": "ランチャー",
    "nav.terms": "利用規約",
    "nav.policy": "ポリシー",

    "home.eyebrow": "Civilization ポータル",
    "home.title": "ポータルホーム",
    "home.description": "公式公開入口、サポート導線、注目OSアクセス、ポータル推薦を確認するためのホーム画面です。",
    "home.badge.publicInformation": "公開情報",
    "home.badge.officialEntry": "公式入口",
    "home.badge.launcherAware": "ランチャー対応",
    "home.lead": "ここから公式OS、サポート情報、ポータル経由のランチャーフローへ進めます。",
    "home.primaryAction": "OS一覧を開く",
    "home.secondaryAction": "ログインへ進む",
    "home.sectionTitle": "主要導線",
    "home.sectionCopy": "CivilizationOSで認証し、必要に応じて他OS機能へ引き継ぎます。",
    "home.card.os.title": "OS一覧",
    "home.card.os.copy": "利用可能なOSと機能入口を確認します。",
    "home.card.auth.title": "認証",
    "home.card.auth.copy": "CivilizationOSログインへ進みます。",
    "home.card.search.title": "検索",
    "home.card.search.copy": "ポータル内のページ、OS、ガイドを検索します。",

    "civilization.eyebrow": "Civilization",
    "civilization.title": "Civilization入口",
    "civilization.description": "PortalはCivilizationの公式公開入口です。各OSへの移動、ログイン導線、利用開始の入口を整理します。",
    "civilization.primaryAction": "ガイドを読む",
    "civilization.secondaryAction": "OS一覧を開く",

    "guide.eyebrow": "ガイド",
    "guide.title": "利用ガイド",
    "guide.description": "Portalの使い方と、CivilizationOSログイン後に他OSへ進む流れを確認します。",
    "guide.item.home": "ホームまたは検索から開始します。",
    "guide.item.os": "OS一覧で対応OSの入口を確認します。",
    "guide.item.auth": "ログインが必要な機能はCivilizationOSで認証します。",
    "guide.item.support": "ヘルプ、ポリシー、利用規約、お問い合わせを確認します。",
    "guide.openHelp": "ヘルプを開く",

    "os.eyebrow": "OS一覧",
    "os.title": "公式OSカタログ",
    "os.description": "Portalから利用できるOS入口を確認します。認証はCivilizationOSが担当します。",
    "os.open": "開く",

    "search.eyebrow": "検索",
    "search.title": "ポータル検索",
    "search.description": "ページ、OS、ガイド、サポート導線を検索します。",
    "search.placeholder": "検索キーワード",
    "search.button": "検索",
    "search.empty": "検索語を入力してください。",
    "search.noResults": "該当する結果がありません。",
    "search.loading": "検索中",

    "login.eyebrow": "ログイン",
    "login.title": "ログイン入口",
    "login.description": "他OS機能を使う前に、CivilizationOSでログインします。",
    "login.business": "事業者としてログイン",
    "login.free": "無料メンバーとしてログイン",
    "login.creator": "StaticArt βクリエイターとしてログイン",
    "login.guidance": "ログイン案内",

    "signup.eyebrow": "新規登録",
    "signup.title": "新規登録入口",
    "signup.description": "アカウントを作成してPortalと対応OSを利用します。表示言語はPortalの言語設定で管理します。",
    "signup.free": "無料メンバーで登録",
    "signup.creator": "StaticArt βクリエイターで登録",
    "signup.backLogin": "ログイン案内へ戻る",

    "language.eyebrow": "言語設定",
    "language.title": "Portal表示言語",
    "language.description": "Portalの表示言語を確認・変更します。初期値はブラウザの言語設定から判定します。ユーザー登録時に別の言語設定は要求しません。",
    "language.currentLocale": "現在の表示言語",
    "language.source": "判定元",
    "language.source.saved": "保存済み設定",
    "language.source.browser": "ブラウザ言語",
    "language.source.default": "既定値",
    "language.browserLanguages": "ブラウザ言語",
    "language.selectLabel": "表示言語",
    "language.option.ja": "日本語",
    "language.option.en": "English",
    "language.save": "この言語で保存",
    "language.clear": "保存設定を解除してブラウザ言語に戻す",
    "language.savedMessage": "言語設定を保存しました。",
    "language.clearedMessage": "保存設定を解除しました。ブラウザ言語を使用します。",

    "authReturn.eyebrow": "認証復帰",
    "authReturn.title": "認証結果の確認",
    "authReturn.description": "CivilizationOSの認証結果を受け取り、元の遷移先へ戻ります。",

    "launcher.eyebrow": "ランチャー",
    "launcher.title": "マイランチャー",
    "launcher.description": "ログイン後に利用可能なOS機能と個人導線を整理します。",

    "help.eyebrow": "ヘルプ",
    "help.title": "ヘルプ",
    "help.description": "Portal、ログイン、ランチャー、対応OSの使い方を確認します。",

    "contact.eyebrow": "お問い合わせ",
    "contact.title": "お問い合わせ",
    "contact.description": "Portalに関する問い合わせ導線です。",

    "policy.eyebrow": "ポリシー",
    "policy.title": "ポリシー",
    "policy.description": "Portalの公開方針、認証方針、データ利用方針を確認します。",

    "terms.eyebrow": "利用規約",
    "terms.title": "利用規約",
    "terms.description": "Portalと関連OSを利用する際の基本条件を確認します。",

    "accessDenied.eyebrow": "アクセス不可",
    "accessDenied.title": "アクセスできません",
    "accessDenied.description": "この機能を利用するには、追加の権限またはログインが必要です。",

    "maintenance.eyebrow": "メンテナンス",
    "maintenance.title": "メンテナンス中",
    "maintenance.description": "現在、一部機能を調整中です。",

    "error.eyebrow": "エラー",
    "error.title": "エラーが発生しました",
    "error.description": "処理を完了できませんでした。時間を置いて再度お試しください。",

    "common.open": "開く",
    "common.back": "戻る",
    "common.loading": "読み込み中",
    "common.error": "エラーが発生しました",

    "footer.copy": "Civilizationの公式ポータル入口です。",
    "footer.location": "ポータルサイト正本: 03直下の08.civilization-portal-site",

    "map.global": "全大陸マップ",
    "map.continent": "各大陸マップ",
    "map.continentInner": "大陸内マップ",
  },
  en: {
    "site.title": "Civilization Portal Site",
    "site.subtitle": "Official web entry for Civilization",
    "site.description": "Official web entry for Civilization.",

    "nav.home": "Home",
    "nav.civilization": "Civilization",
    "nav.osCatalog": "OS Catalog",
    "nav.guide": "Guide",
    "nav.help": "Help",
    "nav.search": "Search",
    "nav.contact": "Contact",
    "nav.language": "Language",
    "nav.login": "Login",
    "nav.signup": "Sign up",
    "nav.launcher": "Launcher",
    "nav.terms": "Terms",
    "nav.policy": "Policy",

    "home.eyebrow": "Civilization Portal",
    "home.title": "Portal home",
    "home.description": "Home page for official public entry, support routing, featured OS access, and portal recommendations.",
    "home.badge.publicInformation": "Public information",
    "home.badge.officialEntry": "Official entry",
    "home.badge.launcherAware": "Launcher-aware",
    "home.lead": "Start here to browse official OS entries, review support resources, and continue through the portal and launcher flow.",
    "home.primaryAction": "Open OS catalog",
    "home.secondaryAction": "Continue to login",
    "home.sectionTitle": "Primary routes",
    "home.sectionCopy": "Authenticate through CivilizationOS and continue to other OS functions as needed.",
    "home.card.os.title": "OS Catalog",
    "home.card.os.copy": "Review available OS entries and function entrances.",
    "home.card.auth.title": "Authentication",
    "home.card.auth.copy": "Continue to CivilizationOS login.",
    "home.card.search.title": "Search",
    "home.card.search.copy": "Search portal pages, OS entries, and guides.",

    "civilization.eyebrow": "Civilization",
    "civilization.title": "Civilization entry",
    "civilization.description": "The Portal is the official public entry surface for Civilization. It organizes OS routing, login flow, and start points.",
    "civilization.primaryAction": "Read guide",
    "civilization.secondaryAction": "Open OS catalog",

    "guide.eyebrow": "Guide",
    "guide.title": "Usage guide",
    "guide.description": "Review how to use the Portal and continue to other OS functions after CivilizationOS login.",
    "guide.item.home": "Start from Home or Search.",
    "guide.item.os": "Use OS Catalog to browse supported OS entries.",
    "guide.item.auth": "Use CivilizationOS authentication for protected functions.",
    "guide.item.support": "Use Help, Policy, Terms, and Contact for support.",
    "guide.openHelp": "Open Help",

    "os.eyebrow": "OS Catalog",
    "os.title": "Official OS catalog",
    "os.description": "Review OS entries available from the Portal. Authentication is owned by CivilizationOS.",
    "os.open": "Open",

    "search.eyebrow": "Search",
    "search.title": "Portal search",
    "search.description": "Search pages, OS entries, guides, and support routes.",
    "search.placeholder": "Search keyword",
    "search.button": "Search",
    "search.empty": "Enter a search keyword.",
    "search.noResults": "No matching results.",
    "search.loading": "Searching",

    "login.eyebrow": "Login",
    "login.title": "Login entry",
    "login.description": "Log in through CivilizationOS before using protected OS functions.",
    "login.business": "Mock Login as Business Operator",
    "login.free": "Mock Login as Free Member",
    "login.creator": "Mock Login as StaticArt Beta Creator",
    "login.guidance": "Login guidance",

    "signup.eyebrow": "Sign up",
    "signup.title": "Signup entry",
    "signup.description": "Create an account to use the Portal and supported OS entries. Display language is managed from the Portal language page.",
    "signup.free": "Sign up as Free Member",
    "signup.creator": "Sign up as StaticArt Beta Creator",
    "signup.backLogin": "Back to Login Guidance",

    "language.eyebrow": "Language",
    "language.title": "Portal display language",
    "language.description": "Review and change the Portal display language. The initial value is resolved from browser language settings. Signup does not require a separate language field.",
    "language.currentLocale": "Current display language",
    "language.source": "Resolution source",
    "language.source.saved": "Saved setting",
    "language.source.browser": "Browser language",
    "language.source.default": "Default",
    "language.browserLanguages": "Browser languages",
    "language.selectLabel": "Display language",
    "language.option.ja": "日本語",
    "language.option.en": "English",
    "language.save": "Save this language",
    "language.clear": "Clear saved setting and use browser language",
    "language.savedMessage": "Language setting saved.",
    "language.clearedMessage": "Saved setting cleared. Browser language will be used.",

    "authReturn.eyebrow": "Auth return",
    "authReturn.title": "Authentication return",
    "authReturn.description": "Receive the CivilizationOS authentication result and continue to the requested destination.",

    "launcher.eyebrow": "Launcher",
    "launcher.title": "My launcher",
    "launcher.description": "Review OS functions and personal routes after login.",

    "help.eyebrow": "Help",
    "help.title": "Help",
    "help.description": "Review Portal, login, launcher, and supported OS usage.",

    "contact.eyebrow": "Contact",
    "contact.title": "Contact",
    "contact.description": "Contact route for Portal-related questions.",

    "policy.eyebrow": "Policy",
    "policy.title": "Policy",
    "policy.description": "Review Portal publication, authentication, and data usage policies.",

    "terms.eyebrow": "Terms",
    "terms.title": "Terms",
    "terms.description": "Review basic terms for Portal and related OS usage.",

    "accessDenied.eyebrow": "Access denied",
    "accessDenied.title": "Access denied",
    "accessDenied.description": "Additional permission or login is required for this function.",

    "maintenance.eyebrow": "Maintenance",
    "maintenance.title": "Maintenance",
    "maintenance.description": "Some functions are currently being adjusted.",

    "error.eyebrow": "Error",
    "error.title": "An error occurred",
    "error.description": "The operation could not be completed. Try again later.",

    "common.open": "Open",
    "common.back": "Back",
    "common.loading": "Loading",
    "common.error": "An error occurred",

    "footer.copy": "Official portal entry for Civilization.",
    "footer.location": "Portal canonical path: root 08.civilization-portal-site under 03.",

    "map.global": "All Continents Map",
    "map.continent": "Continent Map",
    "map.continentInner": "In-Continent Map",
  },
};

export const normalizePortalLocale = (
  value: string | undefined | null,
): PortalLocaleCode => {
  const normalized = (value ?? "").trim().toLowerCase();

  if (normalized.startsWith("ja")) {
    return "ja";
  }

  if (normalized.startsWith("en")) {
    return "en";
  }

  return PORTAL_DEFAULT_LOCALE;
};

export const resolvePortalBrowserLocale = (): PortalLocaleCode => {
  if (typeof navigator === "undefined") {
    return PORTAL_DEFAULT_LOCALE;
  }

  const browserLanguages = Array.isArray(navigator.languages)
    ? navigator.languages
    : [];

  const firstLanguage =
    browserLanguages.find((item) => item && item.trim().length > 0) ??
    navigator.language;

  return normalizePortalLocale(firstLanguage);
};

export const translatePortal = (
  key: PortalI18nKey,
  locale: PortalLocaleCode = PORTAL_DEFAULT_LOCALE,
): string => {
  return (
    PORTAL_I18N_DICTIONARIES[locale]?.[key] ??
    PORTAL_I18N_DICTIONARIES[PORTAL_DEFAULT_LOCALE][key] ??
    key
  );
};

/**
 * PORTAL_HELPDESK_ENTRY_ROUTER_R2_I18N
 * Portal Helpdesk entry/router copy.
 */
export const portalHelpdeskEntryRouterI18n = {
  ja: {
    title: "Helpdesk",
    connectionPending: "AIWorkerOS 接続準備中",
    portalBoundary: "Portal は入口/router のみを担当します。",
  },
  en: {
    title: "Helpdesk",
    connectionPending: "AIWorkerOS connection pending",
    portalBoundary: "Portal owns entry/router only.",
  },
} as const;
