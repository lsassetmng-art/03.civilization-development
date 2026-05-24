// PORTAL_CONCEPT_MAP_NAV_R4
// PORTAL_CONCEPT_MAP_NAV_R6
// PORTAL_AUTH_GATE_R10
import { ConceptMapPage } from "../features/concept-map/concept-map-page";

const assetBase = "/portal/concept-map";

export const metadata = {
  title: "Civilization Portal",
  description: "Civilization Portal concept-map launcher.",
};

export default function Page() {
  return (
    <ConceptMapPage
      title="Civilization Portal"
      theme="portal"
      nodes={[
        {
          id: "portal",
          label: "ポータル",
          action: "back",
          fallbackHref: "/",
          asset: `${assetBase}/metallic-portal-pink.svg`,
          position: "center",
          ariaLabel: "前画面に戻る。戻れない場合はポータルトップ",
        },
        {
          id: "civilization",
          label: "Civilization",
          authGate: {
            afterLoginPath: "/civilization-menu",
            returnTo: "/",
            requestedOsCode: "civilization",
          },
          asset: `${assetBase}/metallic-civilization-blue.svg`,
          position: "top",
          ariaLabel: "Civilizationログイン",
        },
        {
          id: "persona",
          label: "Persona",
          authGate: {
            afterLoginPath: "/persona-menu",
            returnTo: "/",
            requestedOsCode: "persona",
          },
          asset: `${assetBase}/metallic-persona-green.svg`,
          position: "right",
          ariaLabel: "Personaメニュー",
        },
        {
          id: "aiworker",
          label: "AI Worker",
          authGate: {
            afterLoginPath: "/aiworker-menu",
            returnTo: "/",
            requestedOsCode: "aiworker",
          },
          asset: `${assetBase}/metallic-aiworker-red.svg`,
          position: "left",
          ariaLabel: "AIWorkerメニュー",
        },
        {
          id: "ai-support",
          label: "AIサポート",
          href: "/helpdesk",
          asset: `${assetBase}/metallic-ai-support-cyan.svg`,
          position: "bottom",
          ariaLabel: "AIサポート Helpdesk",
        },
        {
          id: "settings",
          label: "設定",
          href: "/language",
          asset: `${assetBase}/metallic-settings-silver.svg`,
          position: "bottomRight",
          ariaLabel: "設定",
        },
      ]}
    />
  );
}
