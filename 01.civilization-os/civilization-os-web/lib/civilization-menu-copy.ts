import type { SupportedLocale } from "@/types/locale";

type MenuCopy = {
  menuKicker: string;
  observeTitle: string;
  observeDescription: string;
  civilizationTitle: string;
  civilizationDescription: string;
  cxTitle: string;
  cxDescription: string;
  storyKicker: string;
  storyTitle: string;
  storyDescription: string;
  storyLockedTitle: string;
  storyLockedDescription: string;
  backToMenu: string;
};

const copy: Record<SupportedLocale, MenuCopy> = {
  ja: {
    menuKicker: "civilization-menu",
    observeTitle: "Civilization観察",
    observeDescription: "全大陸マップへ進み、北大陸・中央大陸・南大陸を観察します。",
    civilizationTitle: "Civilization",
    civilizationDescription: "前の画面に戻ります。",
    cxTitle: "CX22073JWアクセス",
    cxDescription: "AerialAccessToken保有ユーザーのみ、ストーリーモードへ進めます。",
    storyKicker: "story-mode",
    storyTitle: "ストーリーモード",
    storyDescription: "CX22073JWアクセス用のストーリー導線です。正式な権限判定は認証/session実装後に接続します。",
    storyLockedTitle: "AerialAccessTokenが必要です",
    storyLockedDescription: "この導線はAerialAccessToken保有ユーザーのみ利用できます。",
    backToMenu: "Civilizationメニューへ戻る"
  },
  en: {
    menuKicker: "civilization-menu",
    observeTitle: "Observe Civilization",
    observeDescription: "Go to the global map and observe the North, Central, and South continents.",
    civilizationTitle: "Civilization",
    civilizationDescription: "Return to the previous screen.",
    cxTitle: "CX22073JW Access",
    cxDescription: "AerialAccessToken holders can enter story mode.",
    storyKicker: "story-mode",
    storyTitle: "Story Mode",
    storyDescription: "Story route for CX22073JW access. Final permission enforcement will be connected with auth/session implementation.",
    storyLockedTitle: "AerialAccessToken required",
    storyLockedDescription: "This route is available only to users with AerialAccessToken.",
    backToMenu: "Back to Civilization Menu"
  }
};

export function civilizationMenuCopy(locale: SupportedLocale): MenuCopy {
  return copy[locale] ?? copy.ja;
}
