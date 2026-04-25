import type { OsCatalogItem } from "@/types/os/os-catalog";

export const OS_CATALOG: OsCatalogItem[] = [
  {
    osCode: "civilization-os",
    osName: "CivilizationOS",
    headline: "文明シミュレーション世界の中核OS",
    shortDescription: "新規登録・認証の正本であり、ログイン後に文明世界が始まる。",
    status: "login_required",
    eligibilitySummary: "Civilization ID が必要",
  },
  {
    osCode: "persona-os",
    osName: "PersonaOS",
    headline: "Persona 構築と活用の入口",
    shortDescription: "Persona の構築・運用へ進むための入口。",
    status: "login_required",
    eligibilitySummary: "Civilization ID が必要",
  },
  {
    osCode: "business-os",
    osName: "BusinessOS",
    headline: "業務運用系OS",
    shortDescription: "業務・運営・ワークフローへ進むための入口。",
    status: "login_required",
    eligibilitySummary: "Civilization ID が必要",
  },
  {
    osCode: "life-os",
    osName: "LifeOS",
    headline: "生活基盤系OS",
    shortDescription: "生活・個人管理系の入口。",
    status: "login_required",
    eligibilitySummary: "Civilization ID が必要",
  },
  {
    osCode: "game-os",
    osName: "GameOS",
    headline: "ゲーム体験系OS",
    shortDescription: "ゲーム関連体験の入口。",
    status: "planned",
    eligibilitySummary: "順次開放予定",
  },
  {
    osCode: "streaming-os",
    osName: "StreamingOS",
    headline: "配信・表現系OS",
    shortDescription: "配信活動・表現活動の入口。",
    status: "planned",
    eligibilitySummary: "順次開放予定",
  },
];
