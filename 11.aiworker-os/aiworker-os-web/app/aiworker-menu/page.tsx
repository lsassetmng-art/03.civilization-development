// PORTAL_CONCEPT_MAP_NAV_R4
// PORTAL_AIWORKER_ROBOT_RENTAL_R1_R1
// PORTAL_AIWORKER_MENU_R2
// PORTAL_AIWORKER_MENU_R3
// MULTILINGUAL_R2_R3_R2_AIWORKER_ROUTE_TO_HREF_REPAIR
import { ConceptMapPage } from "../../features/concept-map/concept-map-page";

const asset = "/portal/concept-map/metallic-aiworker-red.svg";

export const metadata = {
  title: "AIWorkerメニュー | Civilization Portal",
  description: "Portal-side AIWorker menu concept map.",
};

export default function Page() {
  return (
    <ConceptMapPage
      title="AIWorkerメニュー"
      theme="aiworker"
      nodes={[
        {
          id: "aiworker",
          label: "AI Worker",
          action: "back",
          fallbackHref: "/",
          asset,
          position: "center",
          ariaLabel: "前画面に戻る。戻れない場合は ポータルトップ",
        },
        {
          id: "aiworker-contract",
          label: "AI Worker契約",
          href: "/aiworker-menu/robot-rental-store",
          asset,
          position: "top",
          ariaLabel: "AI Worker契約",
        },
        {
          id: "aiworker-contract-view",
          label: "AI Worker契約閲覧",
  href: "/aiworker-menu/aiworker-contracts",
          asset,
          position: "bottom",
          status: "利用可能",
          ariaLabel: "AI Worker契約閲覧 準備中",
        },
        {
          id: "application-contract-view",
          label: "アプリケーション契約閲覧",
  href: "/aiworker-menu/application-contracts",
          asset,
          position: "bottomRight",
          status: "利用可能",
          ariaLabel: "アプリケーション契約閲覧 準備中",
        },
      ]}
    />
  );
}
