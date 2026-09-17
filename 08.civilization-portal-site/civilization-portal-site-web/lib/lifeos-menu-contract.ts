import type {
  LifeOSCivilizationLanguageCode,
  LifeOSCivilizationLocaleCode,
} from "./lifeos-civilization-login-context";

export type LifeOSMenuLanguageCode = "ja" | "en";

export type LifeOSMenuItemId =
  | "dashboard"
  | "habits"
  | "health"
  | "review"
  | "settings";

export type LifeOSQuickActionId =
  | "daily_checkin"
  | "log_habit"
  | "log_health_metric"
  | "create_goal_event";

export type LifeOSMenuTone =
  | "morning"
  | "habit"
  | "health"
  | "review"
  | "settings";

export type LifeOSLocalizedText = {
  readonly ja: string;
  readonly en: string;
};

export type LifeOSMenuItem = {
  readonly id: LifeOSMenuItemId;
  readonly title: LifeOSLocalizedText;
  readonly description: LifeOSLocalizedText;
  readonly href: string;
  readonly imageSrc: string;
  readonly imageAlt: LifeOSLocalizedText;
  readonly tone: LifeOSMenuTone;
  readonly priority: number;
  readonly primary: boolean;
};

export type LifeOSQuickAction = {
  readonly id: LifeOSQuickActionId;
  readonly title: LifeOSLocalizedText;
  readonly description: LifeOSLocalizedText;
  readonly href: string;
  readonly priority: number;
};

export type LifeOSMenuViewModel = {
  readonly languageCode: LifeOSMenuLanguageCode;
  readonly menuItems: readonly LifeOSMenuItem[];
  readonly quickActions: readonly LifeOSQuickAction[];
  readonly strings: {
    readonly appTitle: string;
    readonly appSubtitle: string;
    readonly inheritedLanguageLabel: string;
    readonly quickActionsTitle: string;
    readonly missingIdentityTitle: string;
    readonly missingIdentityBody: string;
    readonly expiredTitle: string;
    readonly expiredBody: string;
    readonly traceLabel: string;
  };
};

export const LIFEOS_MENU_ITEMS: readonly LifeOSMenuItem[] = [
  {
    id: "dashboard",
    title: {
      ja: "今日の生活",
      en: "Today",
    },
    description: {
      ja: "予定、タスク、リマインダー、生活状態をまとめて確認します。",
      en: "Review today’s priorities, schedule, reminders, and life status.",
    },
    href: "/lifeos?section=dashboard",
    imageSrc: "/images/lifeos/menu/dashboard.png",
    imageAlt: {
      ja: "朝の部屋とカレンダー",
      en: "Morning room and calendar",
    },
    tone: "morning",
    priority: 10,
    primary: true,
  },
  {
    id: "habits",
    title: {
      ja: "習慣",
      en: "Habits",
    },
    description: {
      ja: "ルーティン、タスク、目標を記録・確認します。",
      en: "Track routines, tasks, and goals.",
    },
    href: "/lifeos?section=habits",
    imageSrc: "/images/lifeos/menu/habits.png",
    imageAlt: {
      ja: "チェックリストと習慣カード",
      en: "Checklist and habit cards",
    },
    tone: "habit",
    priority: 20,
    primary: false,
  },
  {
    id: "health",
    title: {
      ja: "体調",
      en: "Health",
    },
    description: {
      ja: "健康、食事、睡眠、活動の記録入口です。",
      en: "Log health, meals, sleep, and activity.",
    },
    href: "/lifeos?section=health",
    imageSrc: "/images/lifeos/menu/health.png",
    imageAlt: {
      ja: "体調ノートとハート",
      en: "Health notebook and heart",
    },
    tone: "health",
    priority: 30,
    primary: false,
  },
  {
    id: "review",
    title: {
      ja: "振り返り",
      en: "Review",
    },
    description: {
      ja: "日次・週次レビュー、気づき、アラートを確認します。",
      en: "Open daily and weekly reviews, insights, and alerts.",
    },
    href: "/lifeos?section=review",
    imageSrc: "/images/lifeos/menu/review.png",
    imageAlt: {
      ja: "日記とグラフ",
      en: "Journal and chart",
    },
    tone: "review",
    priority: 40,
    primary: false,
  },
  {
    id: "settings",
    title: {
      ja: "設定",
      en: "Settings",
    },
    description: {
      ja: "アカウント、通貨、プライバシー、家族共有、連携を管理します。",
      en: "Manage account, currency, privacy, household sharing, and integrations.",
    },
    href: "/lifeos?section=settings",
    imageSrc: "/images/lifeos/menu/settings.png",
    imageAlt: {
      ja: "歯車とプライバシー設定",
      en: "Gear and privacy settings",
    },
    tone: "settings",
    priority: 50,
    primary: false,
  },
];

export const LIFEOS_QUICK_ACTIONS: readonly LifeOSQuickAction[] = [
  {
    id: "daily_checkin",
    title: {
      ja: "今日のチェックイン",
      en: "Daily check-in",
    },
    description: {
      ja: "気分、睡眠、ストレスを短く記録します。",
      en: "Log mood, sleep, and stress quickly.",
    },
    href: "/lifeos?action=daily_checkin",
    priority: 10,
  },
  {
    id: "log_habit",
    title: {
      ja: "習慣を記録",
      en: "Log habit",
    },
    description: {
      ja: "今日の習慣やタスクの進捗を残します。",
      en: "Record today’s habit or task progress.",
    },
    href: "/lifeos?action=log_habit",
    priority: 20,
  },
  {
    id: "log_health_metric",
    title: {
      ja: "体調を記録",
      en: "Log health",
    },
    description: {
      ja: "体調、食事、睡眠、活動の入口です。",
      en: "Open health, meal, sleep, and activity logging.",
    },
    href: "/lifeos?action=log_health_metric",
    priority: 30,
  },
  {
    id: "create_goal_event",
    title: {
      ja: "目標を作る",
      en: "Create goal",
    },
    description: {
      ja: "生活、健康、家、個人目標を作成します。",
      en: "Create a life, health, home, or personal goal.",
    },
    href: "/lifeos?action=create_goal_event",
    priority: 40,
  },
];

export function normalizeLifeOSMenuLanguageCode(input?: {
  readonly languageCode?: LifeOSCivilizationLanguageCode | string | null;
  readonly localeCode?: LifeOSCivilizationLocaleCode | string | null;
}): LifeOSMenuLanguageCode {
  const fromLanguage = normalizeLooseLanguage(input?.languageCode);

  if (fromLanguage !== null) {
    return fromLanguage;
  }

  const fromLocale = normalizeLooseLanguage(input?.localeCode);

  if (fromLocale !== null) {
    return fromLocale;
  }

  return "ja";
}

export function getLifeOSLocalizedText(
  text: LifeOSLocalizedText,
  languageCode: LifeOSMenuLanguageCode,
): string {
  return languageCode === "en" ? text.en : text.ja;
}

export function createLifeOSMenuViewModel(input?: {
  readonly languageCode?: LifeOSCivilizationLanguageCode | string | null;
  readonly localeCode?: LifeOSCivilizationLocaleCode | string | null;
}): LifeOSMenuViewModel {
  const languageCode = normalizeLifeOSMenuLanguageCode(input);

  return {
    languageCode,
    menuItems: [...LIFEOS_MENU_ITEMS].sort((a, b) => a.priority - b.priority),
    quickActions: [...LIFEOS_QUICK_ACTIONS].sort((a, b) => a.priority - b.priority),
    strings:
      languageCode === "en"
        ? {
            appTitle: "LifeOS",
            appSubtitle: "A personal operating system for today’s life, routines, health, and review.",
            inheritedLanguageLabel: "Language inherited from login context",
            quickActionsTitle: "Quick actions",
            missingIdentityTitle: "Login context is missing",
            missingIdentityBody: "Open LifeOS from the Portal login flow again.",
            expiredTitle: "Login context expired",
            expiredBody: "Return to the Portal and sign in again.",
            traceLabel: "Trace",
          }
        : {
            appTitle: "LifeOS",
            appSubtitle: "今日の生活、習慣、体調、振り返りを扱う個人OSです。",
            inheritedLanguageLabel: "ログイン情報から言語を引き継ぎ",
            quickActionsTitle: "クイック操作",
            missingIdentityTitle: "ログイン情報が不足しています",
            missingIdentityBody: "Portalのログイン導線からLifeOSを開き直してください。",
            expiredTitle: "ログイン情報の期限が切れています",
            expiredBody: "Portalに戻って再ログインしてください。",
            traceLabel: "Trace",
          },
  };
}

function normalizeLooseLanguage(value: unknown): LifeOSMenuLanguageCode | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized.length === 0) {
    return null;
  }

  if (normalized === "en" || normalized === "en-us" || normalized.startsWith("en-")) {
    return "en";
  }

  if (normalized === "ja" || normalized === "ja-jp" || normalized.startsWith("ja-")) {
    return "ja";
  }

  return null;
}
