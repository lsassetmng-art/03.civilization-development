// R18 PORTAL OS MENU ENTRY SHELL — NO CANONICAL AUTH BYPASS
// OS application functions remain disabled until CivilizationOS handoff is approved.
import { ConceptMapPage } from "../../features/concept-map/concept-map-page";

const asset = "/portal/concept-map/metallic-business-teal.svg";

export const metadata = {
  title: "BusinessOS | Civilization Portal",
  description: "BusinessOS の公開メニュー入口。各機能への認証連携は準備中です。",
};

export default function Page() {
  return (
    <ConceptMapPage
      title="BusinessOS — 機能接続準備中"
      theme="osmenu"
      nodes={[
        {
          id: "business",
          label: "BusinessOS",
          href: "/",
          asset,
          position: "center" as const,
          ariaLabel: "Civilization Portalへ戻る",
        },
        {
          id: "business-company",
          label: "AI企業管理",
          asset,
          position: "top" as const,
          status: "準備中",
          ariaLabel: "AI企業管理：認証接続準備中",
        },
        {
          id: "business-apps",
          label: "アプリ",
          asset,
          position: "left" as const,
          status: "準備中",
          ariaLabel: "アプリ：認証接続準備中",
        },
        {
          id: "business-worker",
          label: "AI Worker管理",
          asset,
          position: "right" as const,
          status: "準備中",
          ariaLabel: "AI Worker管理：認証接続準備中",
        },
        {
          id: "business-settings",
          label: "設定",
          asset,
          position: "bottom" as const,
          status: "準備中",
          ariaLabel: "設定：認証接続準備中",
        },
      ]}
    />
  );
}
