"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { HOME_NOTICES } from "../../mocks/notices/list";
import { OS_CATALOG } from "../../mocks/os/catalog";
import { PORTAL_LAUNCHER_STATE } from "../../mocks/launcher/state";
import {
  getPortalSessionSummary,
} from "../../services/civilization-auth/mock-session";
import { requestPortalLaunchMatrix } from "../../services/portal-api/launch-client";
import { saveReturnContext } from "../../services/return-context/storage";
import type { PortalSessionSummary } from "../../types/auth";
import type { PortalLaunchMatrixItem } from "../../types/portal-api";
import { ROUTES } from "../../lib/routing/routes";

const orderItemsByCodes = (
  items: PortalLaunchMatrixItem[],
  codes: string[],
): PortalLaunchMatrixItem[] => {
  const map = new Map(items.map((item) => [item.os.code, item]));
  return codes
    .map((code) => map.get(code))
    .filter((item): item is PortalLaunchMatrixItem => Boolean(item));
};

export function LauncherPage() {
  const router = useRouter();

  const [session, setSession] = useState<PortalSessionSummary>({
    isLoggedIn: false,
    entityType: "guest",
    affiliations: [],
    contractTier: "none",
    betaFlags: [],
    region: "JP",
  });

  const [items, setItems] = useState<PortalLaunchMatrixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const currentSession = getPortalSessionSummary();
        if (!active) {
          return;
        }

        setSession(currentSession);

        const response = await requestPortalLaunchMatrix({
          requestedOsCodes: OS_CATALOG.map((os) => os.code),
          requestSource: "launcher",
          session: currentSession,
        });

        if (!active) {
          return;
        }

        setItems(response.data.items);
      } catch (error) {
        if (!active) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Launcher decisions could not be loaded.";
        setErrorMessage(message);
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

  const available = useMemo(
    () => items.filter((item) => item.decision.result === "launchable"),
    [items],
  );

  const unavailable = useMemo(
    () => items.filter((item) => item.decision.result !== "launchable"),
    [items],
  );

  const recent = useMemo(
    () => orderItemsByCodes(items, PORTAL_LAUNCHER_STATE.recentCodes),
    [items],
  );

  const recommended = useMemo(
    () => orderItemsByCodes(items, PORTAL_LAUNCHER_STATE.recommendedCodes),
    [items],
  );

  const handleLoginRequest = () => {
    saveReturnContext({
      returnTarget: ROUTES.launcher,
      requestTimestamp: new Date().toISOString(),
    });
    router.push(ROUTES.login);
  };

  const handleOpen = (item: PortalLaunchMatrixItem) => {
    if (item.decision.result === "login_required") {
      saveReturnContext({
        requestedOsCode: item.os.code,
        returnTarget: ROUTES.launcher,
        requestTimestamp: new Date().toISOString(),
      });
    }

    router.push(item.decision.target);
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="My Launcher"
        title="Launcher entry"
        description="The launcher now resolves OS accessibility through the exact matrix API payload instead of direct in-component decision building."
      />

      {errorMessage ? (
        <StatusMessage
          title="Launcher load failed"
          message={errorMessage}
          variant="danger"
        />
      ) : null}

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Session summary</h2>
          <ul className="list">
            <li>Logged in: {session.isLoggedIn ? "yes" : "no"}</li>
            <li>Display name: {session.displayName ?? "guest"}</li>
            <li>Entity type: {session.entityType}</li>
            <li>Contract tier: {session.contractTier}</li>
            <li>
              Affiliations: {session.affiliations.length > 0 ? session.affiliations.join(", ") : "none"}
            </li>
          </ul>

          {!session.isLoggedIn ? (
            <div className="button-row">
              <button type="button" className="button-link" onClick={handleLoginRequest}>
                Login to Personalize Launcher
              </button>
            </div>
          ) : null}
        </article>
      </section>

      {loading ? (
        <StatusMessage
          title="Loading launcher decisions"
          message="Requesting the launch matrix from the portal API."
          variant="info"
        />
      ) : null}

      {!session.isLoggedIn ? (
        <StatusMessage
          title="Guest launcher mode"
          message="The launcher can still display entry decisions, but login-required and restricted OS entries will not open until a session exists."
          variant="warning"
        />
      ) : null}

      <section className="page-section">
        <div className="grid-2">
          <article className="card">
            <h2 className="section-title">Available now</h2>
            {available.length === 0 ? (
              <p className="card-copy">No OS is currently launchable for this session.</p>
            ) : (
              <div className="stack">
                {available.map((item) => (
                  <div key={item.os.code} className="inline-card">
                    <div>
                      <p className="inline-title">{item.os.name}</p>
                      <p className="inline-copy">{item.decision.reason}</p>
                    </div>
                    <button
                      type="button"
                      className="button-link"
                      onClick={() => handleOpen(item)}
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="card">
            <h2 className="section-title">Blocked or delayed</h2>
            {unavailable.length === 0 ? (
              <p className="card-copy">No blocked entries.</p>
            ) : (
              <div className="stack">
                {unavailable.map((item) => (
                  <div key={item.os.code} className="inline-card">
                    <div>
                      <p className="inline-title">{item.os.name}</p>
                      <p className="inline-copy">{item.decision.reason}</p>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleOpen(item)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="page-section">
        <div className="grid-2">
          <article className="card">
            <h2 className="section-title">Recent OS</h2>
            <div className="stack">
              {recent.map((item) => (
                <div key={item.os.code} className="inline-card">
                  <div>
                    <p className="inline-title">{item.os.name}</p>
                    <p className="inline-copy">{item.os.tagline}</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleOpen(item)}
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <h2 className="section-title">Recommended OS</h2>
            <div className="stack">
              {recommended.map((item) => (
                <div key={item.os.code} className="inline-card">
                  <div>
                    <p className="inline-title">{item.os.name}</p>
                    <p className="inline-copy">{item.os.summary}</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleOpen(item)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Notices for launcher users</h2>
          <div className="stack">
            {HOME_NOTICES.map((notice) => (
              <div key={notice.slug} className="inline-card">
                <div>
                  <p className="inline-title">{notice.title}</p>
                  <p className="inline-copy">{notice.summary}</p>
                </div>
                <span className="chip">{notice.level}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
