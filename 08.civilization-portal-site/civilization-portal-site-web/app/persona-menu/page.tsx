// PORTAL_CONCEPT_MAP_NAV_R4
import { ConceptMapPage } from "../../features/concept-map/concept-map-page";

const asset = "/portal/concept-map/metallic-persona-green.svg";

export const metadata = {
  title: "Personaメニュー | Civilization Portal",
  description: "Portal-side Persona menu concept map.",
};

export default function Page() {
  return (
    <ConceptMapPage
      title="Personaメニュー"
      theme="persona"
      nodes={[
        {
          id: "persona",
          label: "Persona",
          action: "back",
          fallbackHref: "/",
          asset,
          position: "center",
          ariaLabel: "前画面に戻る。戻れない場合はポータルトップ",
        },
        {
          id: "persona-create",
          label: "Persona作成",
          asset,
          position: "top",
          status: "準備中",
          ariaLabel: "Persona作成 Personaビルダー準備中",
        },
        {
          id: "persona-update",
          label: "Persona変更",
          asset,
          position: "left",
          status: "準備中",
          ariaLabel: "Persona変更 準備中",
        },
        {
          id: "persona-delete",
          label: "Persona削除",
          asset,
          position: "right",
          status: "準備中",
          ariaLabel: "Persona削除 準備中",
        },
        {
          id: "persona-view",
          label: "Persona閲覧",
          asset,
          position: "bottom",
          status: "準備中",
          ariaLabel: "Persona閲覧 準備中",
        },
      ]}
    />
  );
}
