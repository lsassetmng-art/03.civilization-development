// R18 PORTAL OS MENU ENTRY SHELL — NO CANONICAL AUTH BYPASS
// OS application functions remain disabled until CivilizationOS handoff is approved.
import { ConceptMapPage } from "../../features/concept-map/concept-map-page";

const asset = "/portal/concept-map/metallic-streaming-orange.svg";

export const metadata = {
  title: "StreamingOS | Civilization Portal",
  description: "StreamingOS の公開メニュー入口。各機能への認証連携は準備中です。",
};

export default function Page() {
  return (
    <ConceptMapPage
      title="StreamingOS — 機能接続準備中"
      theme="osmenu"
      nodes={[
        {
          id: "streaming",
          label: "StreamingOS",
          href: "/",
          asset,
          position: "center" as const,
          ariaLabel: "Civilization Portalへ戻る",
        },
        {
          id: "streaming-studio",
          label: "StreamStudio",
          asset,
          position: "top" as const,
          status: "準備中",
          ariaLabel: "StreamStudio：認証接続準備中",
        },
        {
          id: "streaming-watch",
          label: "StreamWatch",
          asset,
          position: "left" as const,
          status: "準備中",
          ariaLabel: "StreamWatch：認証接続準備中",
        },
        {
          id: "streaming-delivery",
          label: "配信管理",
          asset,
          position: "right" as const,
          status: "準備中",
          ariaLabel: "配信管理：認証接続準備中",
        },
        {
          id: "streaming-settings",
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
