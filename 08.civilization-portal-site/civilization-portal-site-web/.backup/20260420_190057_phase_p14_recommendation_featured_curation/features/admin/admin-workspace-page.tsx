"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { ROUTES } from "../../lib/routing/routes";
import { OS_CATALOG } from "../../mocks/os/catalog";
import {
  getActiveAuthBridgeMode,
  getGatewaySessionSummary,
} from "../../services/civilization-auth/auth-gateway";
  requestAdminListingList,
  requestAdminListingUpsert,
  requestAdminMaintenanceList,
  requestAdminMaintenanceUpsert,
  requestAdminNoticePublish,
  requestAdminNoticesList,
} from "../../services/portal-api/admin-client";
  requestAdminAccessCheck,
  requestAdminAuditAppend,
  requestAdminAuditList,
} from "../../services/portal-api/admin-security-client";
  requestAdminNavigationManifestList,
  requestAdminNavigationManifestUpsert,
} from "../../services/portal-api/navigation-client";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalListingItem,
  PortalListingVisibility,
  PortalMaintenanceItem,
  PortalMaintenanceTargetType,
  PortalNoticeItem,
  PortalNoticeLevel,
  PortalNoticeVisibility,
} from "../../types/portal-admin-api";
import type { PortalAuditLogItem } from "../../types/portal-admin-security-api";
  PortalNavigationAudience,
  PortalNavigationPlacement,
  PortalPageManifestItem,
} from "../../types/portal-navigation-api";

const sortNotices = (items: PortalNoticeItem[]): PortalNoticeItem[] =>
  [...items].sort((a, b) => {
    if (a.publishedOn < b.publishedOn) return 1;
    if (a.publishedOn > b.publishedOn) return -1;
    return a.title.localeCompare(b.title);
  });

const sortListings = (items: PortalListingItem[]): PortalListingItem[] =>
  [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.name.localeCompare(b.name);
  });

const sortAudit = (items: PortalAuditLogItem[]): PortalAuditLogItem[] =>
  [...items].sort((a, b) => {
    if (a.createdAt < b.createdAt) return 1;
    if (a.createdAt > b.createdAt) return -1;
    return a.summary.localeCompare(b.summary);
  });

const sortManifest = (items: PortalPageManifestItem[]): PortalPageManifestItem[] =>
  [...items].sort((a, b) => {
    if (a.placement !== b.placement) {
      return a.placement.localeCompare(b.placement);
    }
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.title.localeCompare(b.title);
  });

export function AdminWorkspacePage() {
  const bridgeMode = getActiveAuthBridgeMode();

  const [session, setSession] = useState<PortalSessionSummary>({
    isLoggedIn: false,
    entityType: "guest",
    affiliations: [],
    contractTier: "none",
    betaFlags: [],
    region: "JP",
  });

  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [accessAllowed, setAccessAllowed] = useState(false);
  const [accessReason, setAccessReason] = useState("Checking admin access...");
  const [actorType, setActorType] = useState("guest");

  const [noticeItems, setNoticeItems] = useState<PortalNoticeItem[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<PortalMaintenanceItem[]>([]);
  const [listingItems, setListingItems] = useState<PortalListingItem[]>([]);
  const [auditItems, setAuditItems] = useState<PortalAuditLogItem[]>([]);
  const [manifestItems, setManifestItems] = useState<PortalPageManifestItem[]>([]);

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeSummary, setNoticeSummary] = useState("");
  const [noticeLevel, setNoticeLevel] = useState<PortalNoticeLevel>("info");
  const [noticeVisibility, setNoticeVisibility] =
    useState<PortalNoticeVisibility>("public");
  const [noticeBusy, setNoticeBusy] = useState(false);

  const [maintenanceTargetType, setMaintenanceTargetType] =
    useState<PortalMaintenanceTargetType>("global");
  const [maintenanceTargetCode, setMaintenanceTargetCode] = useState("portal");
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState("Portal maintenance");
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [maintenanceBusy, setMaintenanceBusy] = useState(false);

  const [listingOsCode, setListingOsCode] = useState(OS_CATALOG[0]?.code ?? "civilization-os");
  const [listingVisibility, setListingVisibility] =
    useState<PortalListingVisibility>("listed");
  const [listingFeatured, setListingFeatured] = useState(false);
  const [listingBadge, setListingBadge] = useState("");
  const [listingSortOrder, setListingSortOrder] = useState("10");
  const [listingBusy, setListingBusy] = useState(false);

  const [auditTargetCode, setAuditTargetCode] = useState("portal");
  const [auditSummary, setAuditSummary] = useState("");
  const [auditBusy, setAuditBusy] = useState(false);

  const [manifestCode, setManifestCode] = useState("home");
  const [manifestTitle, setManifestTitle] = useState("Home");
  const [manifestHref, setManifestHref] = useState("/");
  const [manifestPlacement, setManifestPlacement] =
    useState<PortalNavigationPlacement>("header");
  const [manifestAudience, setManifestAudience] =
    useState<PortalNavigationAudience>("public");
  const [manifestVisibility, setManifestVisibility] = useState<"visible" | "hidden">("visible");
  const [manifestSortOrder, setManifestSortOrder] = useState("10");
  const [manifestDescription, setManifestDescription] = useState("Portal home entry");
  const [manifestRequiresLogin, setManifestRequiresLogin] = useState(false);
  const [manifestOperatorOnly, setManifestOperatorOnly] = useState(false);
  const [manifestBusy, setManifestBusy] = useState(false);

  const canOperate = useMemo(
    () => accessAllowed && !loading,
    [accessAllowed, loading],
  );

  const reloadAuditItems = async (currentSession: PortalSessionSummary) => {
    const response = await requestAdminAuditList({
      area: "portal-admin",
      session: currentSession,
      limit: 30,
    });
    setAuditItems(sortAudit(response.data.items));
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setGlobalError(null);

        const currentSession = getGatewaySessionSummary();
        if (!active) {
          return;
        }
        setSession(currentSession);

        const accessResponse = await requestAdminAccessCheck({
          area: "portal-admin",
          session: currentSession,
        });

        if (!active) {
          return;
        }

        setAccessAllowed(accessResponse.data.allowed);
        setAccessReason(accessResponse.data.reason);
        setActorType(accessResponse.data.actorType);

        if (!accessResponse.data.allowed) {
          setNoticeItems([]);
          setMaintenanceItems([]);
          setListingItems([]);
          setAuditItems([]);
          setManifestItems([]);
          return;
        }

        const [
          noticesResponse,
          maintenanceResponse,
          listingResponse,
          auditResponse,
          manifestResponse,
        ] = await Promise.all([
          requestAdminNoticesList({
            scope: "admin",
            session: currentSession,
          }),
          requestAdminMaintenanceList({
            scope: "admin",
            session: currentSession,
          }),
          requestAdminListingList({
            scope: "admin",
            session: currentSession,
          }),
          requestAdminAuditList({
            area: "portal-admin",
            session: currentSession,
            limit: 30,
          }),
          requestAdminNavigationManifestList({
            scope: "admin",
            session: currentSession,
          }),
        ]);

        if (!active) {
          return;
        }

        setNoticeItems(sortNotices(noticesResponse.data.items));
        setMaintenanceItems(maintenanceResponse.data.items);
        setListingItems(sortListings(listingResponse.data.items));
        setAuditItems(sortAudit(auditResponse.data.items));
        setManifestItems(sortManifest(manifestResponse.data.items));
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Admin data could not be loaded.";

        setGlobalError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  const handlePublishNotice = async () => {
    try {
      setNoticeBusy(true);
      setGlobalError(null);

      const response = await requestAdminNoticePublish({
        session,
        title: noticeTitle,
        summary: noticeSummary,
        level: noticeLevel,
        visibility: noticeVisibility,
        publishedOn: new Date().toISOString().slice(0, 10),
      });

      setNoticeItems((prev) => sortNotices([response.data.item, ...prev]));
      setNoticeTitle("");
      setNoticeSummary("");
      setNoticeLevel("info");
      setNoticeVisibility("public");
      await reloadAuditItems(session);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Notice could not be published.";
      setGlobalError(message);
    } finally {
      setNoticeBusy(false);
    }
  };

  const handleUpsertMaintenance = async () => {
    try {
      setMaintenanceBusy(true);
      setGlobalError(null);

      const response = await requestAdminMaintenanceUpsert({
        session,
        targetType: maintenanceTargetType,
        targetCode: maintenanceTargetCode,
        enabled: maintenanceEnabled,
        title: maintenanceTitle,
        message: maintenanceMessage,
      });

      setMaintenanceItems((prev) => {
        const filtered = prev.filter(
          (item) =>
            !(
              item.targetType === response.data.item.targetType &&
              item.targetCode === response.data.item.targetCode
            ),
        );
        return [...filtered, response.data.item].sort((a, b) =>
          a.targetCode.localeCompare(b.targetCode),
        );
      });

      await reloadAuditItems(session);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Maintenance state could not be saved.";
      setGlobalError(message);
    } finally {
      setMaintenanceBusy(false);
    }
  };

  const handleUpsertListing = async () => {
    try {
      setListingBusy(true);
      setGlobalError(null);

      const sortOrder = Number.parseInt(listingSortOrder || "0", 10);
      const response = await requestAdminListingUpsert({
        session,
        osCode: listingOsCode,
        visibility: listingVisibility,
        featured: listingFeatured,
        badge: listingBadge,
        sortOrder: Number.isNaN(sortOrder) ? 0 : sortOrder,
      });

      setListingItems((prev) => {
        const filtered = prev.filter((item) => item.osCode !== response.data.item.osCode);
        return sortListings([...filtered, response.data.item]);
      });

      await reloadAuditItems(session);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Listing could not be saved.";
      setGlobalError(message);
    } finally {
      setListingBusy(false);
    }
  };

  const handleAppendAudit = async () => {
    try {
      setAuditBusy(true);
      setGlobalError(null);

      const response = await requestAdminAuditAppend({
        area: "portal-admin",
        session,
        targetCode: auditTargetCode,
        summary: auditSummary,
      });

      setAuditItems((prev) => sortAudit([response.data.item, ...prev]));
      setAuditSummary("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Audit note could not be appended.";
      setGlobalError(message);
    } finally {
      setAuditBusy(false);
    }
  };

  const handleUpsertManifest = async () => {
    try {
      setManifestBusy(true);
      setGlobalError(null);

      const sortOrder = Number.parseInt(manifestSortOrder || "0", 10);

      const response = await requestAdminNavigationManifestUpsert({
        scope: "admin",
        session,
        code: manifestCode,
        title: manifestTitle,
        href: manifestHref,
        placement: manifestPlacement,
        audience: manifestAudience,
        visibility: manifestVisibility,
        sortOrder: Number.isNaN(sortOrder) ? 0 : sortOrder,
        description: manifestDescription,
        requiresLogin: manifestRequiresLogin,
        operatorOnly: manifestOperatorOnly,
      });

      setManifestItems((prev) => {
        const filtered = prev.filter((item) => item.code !== response.data.item.code);
        return sortManifest([...filtered, response.data.item]);
      });

      await reloadAuditItems(session);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Navigation manifest could not be saved.";
      setGlobalError(message);
    } finally {
      setManifestBusy(false);
    }
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Portal Operations"
        title="Admin workspace"
        description="This workspace now uses operator role gating, audit logging, and navigation manifest control."
      />

      <StatusMessage
        title={`Auth bridge mode: ${bridgeMode} / Actor type: ${actorType}`}
        message={accessReason}
        variant={accessAllowed ? "success" : "warning"}
      />

      {loading ? (
        <StatusMessage
          title="Loading admin data"
          message="Checking access and loading notices, maintenance, listings, navigation manifests, and audit logs."
          variant="info"
        />
      ) : null}

      {globalError ? (
        <StatusMessage
          title="Admin action failed"
          message={globalError}
          variant="danger"
        />
      ) : null}

      {!loading && !accessAllowed ? (
        <section className="page-section">
          <article className="card">
            <h2 className="section-title">Admin access is blocked</h2>
            <p className="section-copy">
              The current session does not satisfy the portal admin operator gate.
            </p>
            <ul className="list">
              <li>Logged in: {session.isLoggedIn ? "yes" : "no"}</li>
              <li>Entity type: {session.entityType}</li>
              <li>Contract tier: {session.contractTier}</li>
              <li>
                Affiliations: {session.affiliations.length > 0 ? session.affiliations.join(", ") : "none"}
              </li>
            </ul>
            <div className="button-row">
              <Link href={ROUTES.login} className="button-link">
                Go to Login
              </Link>
              <Link href={ROUTES.launcher} className="secondary-link">
                Open Launcher
              </Link>
            </div>
          </article>
        </section>
      ) : null}

      {canOperate ? (
        <>
          <AdminAssetManifestPanel
            session={session}
            canOperate={canOperate}
            onError={setGlobalError}
            onAuditRefresh={() => reloadAuditItems(session)}
          />

          <AdminSeoPagePanel
            session={session}
            canOperate={canOperate}
            onError={setGlobalError}
            onAuditRefresh={() => reloadAuditItems(session)}
          />

          <AdminSearchIndexPanel
            session={session}
            canOperate={canOperate}
            onError={setGlobalError}
            onAuditRefresh={() => reloadAuditItems(session)}
          />

          <AdminCmsPagePanel
            session={session}
            canOperate={canOperate}
            onError={setGlobalError}
            onAuditRefresh={() => reloadAuditItems(session)}
          />

          <section className="page-section">
            <h2 className="section-title">Navigation manifest control</h2>
            <article className="card">
              <div className="form-grid">
                <label className="field-block">
                  <span className="label-text">Code</span>
                  <input
                    className="text-input"
                    value={manifestCode}
                    onChange={(event) => setManifestCode(event.target.value)}
                    placeholder="home / admin / launcher"
                  />
                </label>

                <label className="field-block">
                  <span className="label-text">Title</span>
                  <input
                    className="text-input"
                    value={manifestTitle}
                    onChange={(event) => setManifestTitle(event.target.value)}
                    placeholder="Menu title"
                  />
                </label>

                <label className="field-block field-span-2">
                  <span className="label-text">Href</span>
                  <input
                    className="text-input"
                    value={manifestHref}
                    onChange={(event) => setManifestHref(event.target.value)}
                    placeholder="/admin"
                  />
                </label>

                <label className="field-block">
                  <span className="label-text">Placement</span>
                  <select
                    className="select-input"
                    value={manifestPlacement}
                    onChange={(event) =>
                      setManifestPlacement(event.target.value as PortalNavigationPlacement)
                    }
                  >
                    <option value="header">header</option>
                    <option value="footer">footer</option>
                    <option value="launcher">launcher</option>
                    <option value="admin">admin</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Audience</span>
                  <select
                    className="select-input"
                    value={manifestAudience}
                    onChange={(event) =>
                      setManifestAudience(event.target.value as PortalNavigationAudience)
                    }
                  >
                    <option value="public">public</option>
                    <option value="member">member</option>
                    <option value="operator">operator</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Visibility</span>
                  <select
                    className="select-input"
                    value={manifestVisibility}
                    onChange={(event) =>
                      setManifestVisibility(event.target.value as "visible" | "hidden")
                    }
                  >
                    <option value="visible">visible</option>
                    <option value="hidden">hidden</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Sort order</span>
                  <input
                    className="text-input"
                    value={manifestSortOrder}
                    onChange={(event) => setManifestSortOrder(event.target.value)}
                    placeholder="10"
                  />
                </label>

                <label className="field-block field-span-2">
                  <span className="label-text">Description</span>
                  <textarea
                    className="text-area"
                    value={manifestDescription}
                    onChange={(event) => setManifestDescription(event.target.value)}
                    placeholder="Short manifest description"
                    rows={4}
                  />
                </label>

                <label className="field-block checkbox-field">
                  <input
                    type="checkbox"
                    checked={manifestRequiresLogin}
                    onChange={(event) => setManifestRequiresLogin(event.target.checked)}
                  />
                  <span className="label-text">Requires login</span>
                </label>

                <label className="field-block checkbox-field">
                  <input
                    type="checkbox"
                    checked={manifestOperatorOnly}
                    onChange={(event) => setManifestOperatorOnly(event.target.checked)}
                  />
                  <span className="label-text">Operator only</span>
                </label>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="button-link"
                  onClick={handleUpsertManifest}
                  disabled={manifestBusy}
                >
                  {manifestBusy ? "Saving..." : "Save Navigation Manifest"}
                </button>
              </div>
            </article>

            <div className="grid-2">
              {manifestItems.map((item) => (
                <article key={item.id} className="card">
                  <p className="eyebrow">
                    {item.placement.toUpperCase()} / {item.audience.toUpperCase()}
                  </p>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-copy">{item.href}</p>
                  <div className="chip-row">
                    <span className="chip">{item.visibility}</span>
                    <span className="chip">sort:{item.sortOrder}</span>
                    {item.requiresLogin ? <span className="chip">login</span> : null}
                    {item.operatorOnly ? <span className="chip">operator</span> : null}
                  </div>
                  <p className="meta-text">{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="page-section">
            <h2 className="section-title">Publish notice</h2>
            <article className="card">
              <div className="form-grid">
                <label className="field-block">
                  <span className="label-text">Title</span>
                  <input
                    className="text-input"
                    value={noticeTitle}
                    onChange={(event) => setNoticeTitle(event.target.value)}
                    placeholder="Portal notice title"
                  />
                </label>

                <label className="field-block field-span-2">
                  <span className="label-text">Summary</span>
                  <textarea
                    className="text-area"
                    value={noticeSummary}
                    onChange={(event) => setNoticeSummary(event.target.value)}
                    placeholder="Portal notice summary"
                    rows={4}
                  />
                </label>

                <label className="field-block">
                  <span className="label-text">Level</span>
                  <select
                    className="select-input"
                    value={noticeLevel}
                    onChange={(event) => setNoticeLevel(event.target.value as PortalNoticeLevel)}
                  >
                    <option value="info">info</option>
                    <option value="warning">warning</option>
                    <option value="maintenance">maintenance</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Visibility</span>
                  <select
                    className="select-input"
                    value={noticeVisibility}
                    onChange={(event) =>
                      setNoticeVisibility(event.target.value as PortalNoticeVisibility)
                    }
                  >
                    <option value="public">public</option>
                    <option value="admin">admin</option>
                  </select>
                </label>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="button-link"
                  onClick={handlePublishNotice}
                  disabled={noticeBusy}
                >
                  {noticeBusy ? "Publishing..." : "Publish Notice"}
                </button>
              </div>
            </article>

            <div className="grid-2">
              {noticeItems.map((item) => (
                <article key={item.id} className="card">
                  <p className="eyebrow">
                    {item.level.toUpperCase()} / {item.visibility.toUpperCase()}
                  </p>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-copy">{item.summary}</p>
                  <p className="meta-text">Published: {item.publishedOn}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="page-section">
            <h2 className="section-title">Maintenance control</h2>
            <article className="card">
              <div className="form-grid">
                <label className="field-block">
                  <span className="label-text">Target type</span>
                  <select
                    className="select-input"
                    value={maintenanceTargetType}
                    onChange={(event) =>
                      setMaintenanceTargetType(
                        event.target.value as PortalMaintenanceTargetType,
                      )
                    }
                  >
                    <option value="global">global</option>
                    <option value="os">os</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Target code</span>
                  <input
                    className="text-input"
                    value={maintenanceTargetCode}
                    onChange={(event) => setMaintenanceTargetCode(event.target.value)}
                    placeholder="portal or os code"
                  />
                </label>

                <label className="field-block field-span-2">
                  <span className="label-text">Title</span>
                  <input
                    className="text-input"
                    value={maintenanceTitle}
                    onChange={(event) => setMaintenanceTitle(event.target.value)}
                    placeholder="Maintenance title"
                  />
                </label>

                <label className="field-block field-span-2">
                  <span className="label-text">Message</span>
                  <textarea
                    className="text-area"
                    value={maintenanceMessage}
                    onChange={(event) => setMaintenanceMessage(event.target.value)}
                    placeholder="Maintenance message"
                    rows={4}
                  />
                </label>

                <label className="field-block checkbox-field">
                  <input
                    type="checkbox"
                    checked={maintenanceEnabled}
                    onChange={(event) => setMaintenanceEnabled(event.target.checked)}
                  />
                  <span className="label-text">Enabled</span>
                </label>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="button-link"
                  onClick={handleUpsertMaintenance}
                  disabled={maintenanceBusy}
                >
                  {maintenanceBusy ? "Saving..." : "Save Maintenance State"}
                </button>
              </div>
            </article>

            <div className="grid-2">
              {maintenanceItems.map((item) => (
                <article key={item.id} className="card">
                  <p className="eyebrow">
                    {item.targetType.toUpperCase()} / {item.targetCode}
                  </p>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-copy">{item.message}</p>
                  <div className="chip-row">
                    <span className="chip">{item.enabled ? "enabled" : "disabled"}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="page-section">
            <h2 className="section-title">OS listing control</h2>
            <article className="card">
              <div className="form-grid">
                <label className="field-block">
                  <span className="label-text">OS code</span>
                  <select
                    className="select-input"
                    value={listingOsCode}
                    onChange={(event) => setListingOsCode(event.target.value)}
                  >
                    {OS_CATALOG.map((os) => (
                      <option key={os.code} value={os.code}>
                        {os.code}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Visibility</span>
                  <select
                    className="select-input"
                    value={listingVisibility}
                    onChange={(event) =>
                      setListingVisibility(event.target.value as PortalListingVisibility)
                    }
                  >
                    <option value="listed">listed</option>
                    <option value="hidden">hidden</option>
                    <option value="featured-only">featured-only</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Badge</span>
                  <input
                    className="text-input"
                    value={listingBadge}
                    onChange={(event) => setListingBadge(event.target.value)}
                    placeholder="featured / beta / curated"
                  />
                </label>

                <label className="field-block">
                  <span className="label-text">Sort order</span>
                  <input
                    className="text-input"
                    value={listingSortOrder}
                    onChange={(event) => setListingSortOrder(event.target.value)}
                    placeholder="10"
                  />
                </label>

                <label className="field-block checkbox-field">
                  <input
                    type="checkbox"
                    checked={listingFeatured}
                    onChange={(event) => setListingFeatured(event.target.checked)}
                  />
                  <span className="label-text">Featured</span>
                </label>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="button-link"
                  onClick={handleUpsertListing}
                  disabled={listingBusy}
                >
                  {listingBusy ? "Saving..." : "Save Listing"}
                </button>
              </div>
            </article>

            <div className="grid-2">
              {listingItems.map((item) => (
                <article key={item.id} className="card">
                  <p className="eyebrow">{item.osCode}</p>
                  <h3 className="card-title">{item.name}</h3>
                  <p className="card-copy">{item.category}</p>
                  <div className="chip-row">
                    <span className="chip">{item.visibility}</span>
                    <span className="chip">sort:{item.sortOrder}</span>
                    {item.featured ? <span className="chip">featured</span> : null}
                    {item.badge ? <span className="chip">{item.badge}</span> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="page-section">
            <h2 className="section-title">Audit log</h2>
            <article className="card">
              <div className="form-grid">
                <label className="field-block">
                  <span className="label-text">Target code</span>
                  <input
                    className="text-input"
                    value={auditTargetCode}
                    onChange={(event) => setAuditTargetCode(event.target.value)}
                    placeholder="portal / os code / slug"
                  />
                </label>

                <label className="field-block field-span-2">
                  <span className="label-text">Summary</span>
                  <textarea
                    className="text-area"
                    value={auditSummary}
                    onChange={(event) => setAuditSummary(event.target.value)}
                    placeholder="Short operator note for the audit trail"
                    rows={4}
                  />
                </label>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="button-link"
                  onClick={handleAppendAudit}
                  disabled={auditBusy}
                >
                  {auditBusy ? "Appending..." : "Append Audit Note"}
                </button>
              </div>
            </article>

            <div className="stack">
              {auditItems.map((item) => (
                <article key={item.id} className="card">
                  <p className="eyebrow">
                    {item.actionType.toUpperCase()} / {item.status.toUpperCase()}
                  </p>
                  <h3 className="card-title">{item.summary}</h3>
                  <p className="card-copy">
                    Actor: {item.actorDisplayName}
                    {item.actorUserId ? ` / ${item.actorUserId}` : ""}
                  </p>
                  <p className="card-copy">Target: {item.targetCode}</p>
                  <p className="meta-text">Created: {item.createdAt}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
