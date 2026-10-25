// R18 PORTAL OS MENU ENTRY SHELL — NO CANONICAL AUTH BYPASS
// OS application functions remain disabled until CivilizationOS handoff is approved.
import { ConceptMapPage } from "../../features/concept-map/concept-map-page";

const asset = "/portal/concept-map/metallic-staticart-violet.svg";

export const metadata = {
  title: "StaticArtOS | Civilization Portal",
  description: "StaticArtOS の公開メニュー入口。各機能への認証連携は準備中です。",
};

export default function Page() {
  return (
    <ConceptMapPage
      title="StaticArtOS — 機能接続準備中"
      theme="osmenu"
      nodes={[
        {
          id: "staticart",
          label: "StaticArtOS",
          href: "/",
          asset,
          position: "center" as const,
          ariaLabel: "Civilization Portalへ戻る",
        },
        {
          id: "staticart-asset",
          label: "作品管理",
          asset,
          position: "top" as const,
          status: "準備中",
          ariaLabel: "作品管理：認証接続準備中",
        },
        {
          id: "staticart-gallery",
          label: "ギャラリー",
          asset,
          position: "left" as const,
          status: "準備中",
          ariaLabel: "ギャラリー：認証接続準備中",
        },
        {
          id: "staticart-exhibition",
          label: "個展開催",
          asset,
          position: "right" as const,
          status: "準備中",
          ariaLabel: "個展開催：認証接続準備中",
        },
        {
          id: "staticart-settings",
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
