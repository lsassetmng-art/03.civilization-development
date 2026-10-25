// R18 PORTAL OS MENU ENTRY SHELL — NO CANONICAL AUTH BYPASS
// OS application functions remain disabled until CivilizationOS handoff is approved.
import { ConceptMapPage } from "../../features/concept-map/concept-map-page";

const asset = "/portal/concept-map/metallic-game-indigo.svg";

export const metadata = {
  title: "GameOS | Civilization Portal",
  description: "GameOS の公開メニュー入口。各機能への認証連携は準備中です。",
};

export default function Page() {
  return (
    <ConceptMapPage
      title="GameOS — 機能接続準備中"
      theme="osmenu"
      nodes={[
        {
          id: "game",
          label: "GameOS",
          href: "/",
          asset,
          position: "center" as const,
          ariaLabel: "Civilization Portalへ戻る",
        },
        {
          id: "game-builder",
          label: "ゲーム制作",
          asset,
          position: "top" as const,
          status: "準備中",
          ariaLabel: "ゲーム制作：認証接続準備中",
        },
        {
          id: "game-template",
          label: "テンプレート",
          asset,
          position: "left" as const,
          status: "準備中",
          ariaLabel: "テンプレート：認証接続準備中",
        },
        {
          id: "game-project",
          label: "プロジェクト",
          asset,
          position: "right" as const,
          status: "準備中",
          ariaLabel: "プロジェクト：認証接続準備中",
        },
        {
          id: "game-settings",
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
