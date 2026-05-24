// PORTAL_CONCEPT_MAP_NAV_R4
// PORTAL_CONCEPT_MAP_NAV_R5
// PORTAL_CONCEPT_MAP_NAV_R6
// PORTAL_CONCEPT_MAP_NAV_R7
// PORTAL_CONCEPT_MAP_NAV_R8
// PORTAL_AUTH_GATE_R10
// PORTAL_CONCEPT_MAP_NAV_R11
"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { buildCivilizationAuthUrl } from "../../lib/auth/civilization-auth-gate";

type NodePosition = "center" | "top" | "left" | "right" | "bottom" | "bottomRight";
type NodeAction = "link" | "back";

type AuthGateSpec = {
  afterLoginPath: string;
  requestedOsCode: string;
  returnTo?: string;
  basePath?: string;
  aerialAccessToken?: string;
};

type ConceptNode = {
  id: string;
  label: string;
  href?: string;
  asset: string;
  position: NodePosition;
  status?: string;
  ariaLabel?: string;
  action?: NodeAction;
  fallbackHref?: string;
  authGate?: AuthGateSpec;
};

type ConceptMapPageProps = {
  title: string;
  nodes: ConceptNode[];
  theme: "portal" | "persona" | "aiworker";
};

const themeStyle: Record<ConceptMapPageProps["theme"], { background: string }> = {
  portal: {
    background:
      "radial-gradient(circle at 50% 34%, rgba(255,255,255,.96), rgba(231,238,255,.9) 46%, rgba(210,218,238,.92))",
  },
  persona: {
    background:
      "radial-gradient(circle at 50% 34%, rgba(245,255,250,.98), rgba(198,246,220,.9) 46%, rgba(138,207,171,.88))",
  },
  aiworker: {
    background:
      "radial-gradient(circle at 50% 34%, rgba(255,247,247,.98), rgba(255,207,207,.9) 46%, rgba(216,123,123,.88))",
  },
};

const globalChromeResetCss = `
body:has([data-portal-concept-map-page]) header:not([data-portal-concept-title-bar]),
body:has([data-portal-concept-map-page]) nav,
body:has([data-portal-concept-map-page]) footer,
body:has([data-portal-concept-map-page]) [data-global-header],
body:has([data-portal-concept-map-page]) [data-global-footer],
body:has([data-portal-concept-map-page]) [data-portal-global-header],
body:has([data-portal-concept-map-page]) [data-portal-global-footer] {
  display: none !important;
}
body:has([data-portal-concept-map-page]) {
  margin: 0 !important;
}
`;

const mapStyle: CSSProperties = {
  position: "relative",
  width: "min(94vw, 760px)",
  height: "min(76vh, 680px)",
  minHeight: "530px",
  margin: "0 auto",
};

const titleBarStyle: CSSProperties = {
  height: "58px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderBottom: "1px solid rgba(15,23,42,.12)",
  background: "rgba(255,255,255,.78)",
  backdropFilter: "blur(14px)",
  fontSize: "20px",
  fontWeight: 800,
  letterSpacing: ".02em",
  color: "#0f172a",
};

const pageStyleBase: CSSProperties = {
  minHeight: "100vh",
  overflow: "hidden",
  color: "#0f172a",
};

const bodyStyle: CSSProperties = {
  minHeight: "calc(100vh - 58px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px",
};

function positionStyle(position: NodePosition): CSSProperties {
  const base: CSSProperties = {
    position: "absolute",
    zIndex: position === "center" ? 2 : 1,
    left: "50%",
    top: "50%",
  };

  switch (position) {
    case "center":
      return { ...base, transform: "translate(-50%, -50%)" };
    case "top":
      return { ...base, transform: "translate(-50%, calc(-50% - clamp(102px, 14vw, 122px)))" };
    case "left":
      return {
        ...base,
        transform:
          "translate(calc(-50% - clamp(108px, 15vw, 130px)), calc(-50% + clamp(44px, 6vw, 56px)))",
      };
    case "right":
      return {
        ...base,
        transform:
          "translate(calc(-50% + clamp(108px, 15vw, 130px)), calc(-50% + clamp(44px, 6vw, 56px)))",
      };
    case "bottom":
      return {
        ...base,
        transform:
          "translate(calc(-50% - clamp(44px, 6vw, 56px)), calc(-50% + clamp(120px, 16vw, 144px)))",
      };
    case "bottomRight":
      return {
        ...base,
        transform:
          "translate(calc(-50% + clamp(42px, 6.5vw, 68px)), calc(-50% + clamp(120px, 16vw, 144px)))",
      };
  }
}

function nodeSize(position: NodePosition): string {
  if (position === "center") {
    return "clamp(126px, 22vw, 178px)";
  }
  return "clamp(104px, 17vw, 146px)";
}

function goBack(fallbackHref: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = fallbackHref;
}

function authGateFallbackHref(authGate: AuthGateSpec): string {
  return buildCivilizationAuthUrl({
    ...authGate,
    languageCode: "ja",
  });
}

function NodeVisual({ node }: { node: ConceptNode }) {
  const size = nodeSize(node.position);

  return (
    <span
      data-portal-concept-node={node.id}
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        position: "relative",
        textDecoration: "none",
        borderRadius: "999px",
        filter: node.href || node.action === "back" || node.authGate ? "none" : "grayscale(.08) opacity(.82)",
      }}
    >
      <img
        src={node.asset}
        alt=""
        aria-hidden="true"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          position: "absolute",
          inset: 0,
        }}
      />
      <span
        style={{
          zIndex: 1,
          maxWidth: "78%",
          textAlign: "center",
          color: "#fff",
          fontWeight: 900,
          lineHeight: 1.16,
          fontSize: node.position === "center" ? "clamp(17px, 2.4vw, 25px)" : "clamp(13px, 1.9vw, 20px)",
          textShadow: "0 2px 8px rgba(0,0,0,.58)",
        }}
      >
        {node.label}
      </span>
      {node.status ? (
        <span
          style={{
            position: "absolute",
            zIndex: 2,
            bottom: "13%",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "2px 8px",
            borderRadius: "999px",
            background: "rgba(15,23,42,.58)",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {node.status}
        </span>
      ) : null}
    </span>
  );
}

function NodeShell({ node }: { node: ConceptNode }) {
  const commonStyle: CSSProperties = {
    ...positionStyle(node.position),
    textDecoration: "none",
    WebkitTapHighlightColor: "transparent",
  };

  if (node.action === "back") {
    return (
      <button
        type="button"
        data-portal-concept-back-node={node.id}
        aria-label={node.ariaLabel ?? `${node.label} 前画面に戻る`}
        onClick={() => goBack(node.fallbackHref ?? "/")}
        style={{
          ...commonStyle,
          border: 0,
          padding: 0,
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <NodeVisual node={node} />
      </button>
    );
  }

  if (node.authGate) {
    const fallbackHref = authGateFallbackHref(node.authGate);

    return (
      <Link
        href={fallbackHref}
        data-portal-auth-gate-node={node.id}
        data-after-login-path={node.authGate.afterLoginPath}
        data-requested-os-code={node.authGate.requestedOsCode}
        aria-label={node.ariaLabel ?? node.label}
        onClick={(event) => {
          event.preventDefault();
          window.location.href = buildCivilizationAuthUrl(node.authGate as AuthGateSpec);
        }}
        style={commonStyle}
      >
        <NodeVisual node={node} />
      </Link>
    );
  }

  if (node.href) {
    return (
      <Link href={node.href} aria-label={node.ariaLabel ?? node.label} style={commonStyle}>
        <NodeVisual node={node} />
      </Link>
    );
  }

  return (
    <div aria-disabled="true" aria-label={node.ariaLabel ?? `${node.label} 準備中`} style={commonStyle}>
      <NodeVisual node={node} />
    </div>
  );
}

export function ConceptMapPage({ title, nodes, theme }: ConceptMapPageProps) {
  const style = themeStyle[theme];

  return (
    <main
      data-portal-concept-map-page={theme}
      data-portal-concept-layout="touching-circles"
      data-portal-common-chrome="hidden"
      style={{
        ...pageStyleBase,
        background: style.background,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: globalChromeResetCss }} />

      <header data-portal-concept-title-bar="true" style={titleBarStyle}>
        {title}
      </header>

      <section style={bodyStyle} aria-label={title}>
        <div style={mapStyle}>
          {nodes.map((node) => (
            <NodeShell key={node.id} node={node} />
          ))}
        </div>
      </section>
    </main>
  );
}
