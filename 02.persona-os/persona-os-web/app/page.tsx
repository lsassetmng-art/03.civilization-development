"use client";
// PORTAL_CONCEPT_MAP_NAV_R4
// MULTILINGUAL_R2_R3_R2_PERSONA_SYNTAX_REPAIR

import { useEffect } from "react";
import { usePersonaI18n } from "../components/i18n/persona-i18n-provider";
import { ConceptMapPage } from "../features/concept-map/concept-map-page";

const asset = "/portal/concept-map/metallic-persona-green.svg";

export default function Page() {
  const { t } = usePersonaI18n();

  useEffect(() => {
    document.title = t("personaMenu.pageTitle");
  }, [t]);

  return (
    <ConceptMapPage
      title={t("personaMenu.title")}
      theme="persona"
      nodes={[
        {
          id: "persona",
          label: "Persona",
          action: "back",
          fallbackHref: "/",
          asset,
          position: "center",
          ariaLabel: t("personaMenu.backAria"),
        },
        {
          id: "persona-create",
          label: t("personaMenu.create"),
          href: "/persona-menu/persona-create",
          asset,
          position: "top",
          ariaLabel: t("personaMenu.createAria"),
        },
        {
          id: "persona-update",
          label: t("personaMenu.update"),
          asset,
          position: "left",
          status: t("personaMenu.pending"),
          ariaLabel: t("personaMenu.updateAria"),
        },
        {
          id: "persona-delete",
          label: t("personaMenu.delete"),
          asset,
          position: "right",
          status: t("personaMenu.pending"),
          ariaLabel: t("personaMenu.deleteAria"),
        },
        {
          id: "persona-view",
          label: t("personaMenu.view"),
          asset,
          position: "bottom",
          status: t("personaMenu.pending"),
          ariaLabel: t("personaMenu.viewAria"),
        },
      ]}
    />
  );
}
