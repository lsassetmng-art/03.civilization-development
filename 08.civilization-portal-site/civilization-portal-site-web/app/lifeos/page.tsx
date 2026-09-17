import {
  createLifeOSCivilizationLoginContext,
  hasLifeOSCivilizationLoginContextIdentity,
  isLifeOSCivilizationLoginContextExpired,
} from "../../lib/lifeos-civilization-login-context";
import {
  createLifeOSMenuViewModel,
  getLifeOSLocalizedText,
  type LifeOSMenuItem,
} from "../../lib/lifeos-menu-contract";

type SearchParams = Record<string, string | string[] | undefined>;

type LifeOSPageProps = {
  readonly searchParams?: SearchParams | Promise<SearchParams>;
};

const toneBackground: Record<LifeOSMenuItem["tone"], string> = {
  morning: "linear-gradient(135deg, rgba(255,247,222,0.96), rgba(255,214,165,0.86))",
  habit: "linear-gradient(135deg, rgba(229,255,241,0.96), rgba(157,224,190,0.86))",
  health: "linear-gradient(135deg, rgba(255,235,239,0.96), rgba(255,174,188,0.86))",
  review: "linear-gradient(135deg, rgba(239,235,255,0.96), rgba(185,174,255,0.86))",
  settings: "linear-gradient(135deg, rgba(236,242,255,0.96), rgba(170,190,230,0.86))",
};

export default async function LifeOSPage({ searchParams }: LifeOSPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const context = createLifeOSCivilizationLoginContext({
    civilizationId: firstSearchParam(resolvedSearchParams.civilizationId ?? resolvedSearchParams.civilization_id),
    owner: firstSearchParam(resolvedSearchParams.owner),
    sessionRef: firstSearchParam(resolvedSearchParams.sessionRef ?? resolvedSearchParams.session_ref),
    localeCode: firstSearchParam(resolvedSearchParams.localeCode ?? resolvedSearchParams.locale_code ?? resolvedSearchParams.locale),
    languageCode: firstSearchParam(resolvedSearchParams.languageCode ?? resolvedSearchParams.language_code),
    requestedOsCode: firstSearchParam(resolvedSearchParams.requestedOsCode ?? resolvedSearchParams.requested_os_code ?? resolvedSearchParams.requested_os ?? resolvedSearchParams.os) ?? "lifeos",
    returnTo: firstSearchParam(resolvedSearchParams.returnTo ?? resolvedSearchParams.return_to),
    afterLoginPath: firstSearchParam(resolvedSearchParams.afterLoginPath ?? resolvedSearchParams.after_login_path),
    issuedAt: firstSearchParam(resolvedSearchParams.issuedAt ?? resolvedSearchParams.issued_at),
    expiresAt: firstSearchParam(resolvedSearchParams.expiresAt ?? resolvedSearchParams.expires_at),
  });

  const menu = createLifeOSMenuViewModel({
    languageCode: context.languageCode,
    localeCode: context.localeCode,
  });

  const missingIdentity = !hasLifeOSCivilizationLoginContextIdentity(context);
  const expired = isLifeOSCivilizationLoginContextExpired(context);

  return (
    <main className="lifeos-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">{menu.strings.inheritedLanguageLabel}</p>
          <h1>{menu.strings.appTitle}</h1>
          <p className="subtitle">{menu.strings.appSubtitle}</p>
        </div>
        <div className="context-pill">
          <span>{context.localeCode}</span>
          <span>{context.requestedOsCode}</span>
        </div>
      </section>

      {missingIdentity ? (
        <StatusPanel title={menu.strings.missingIdentityTitle} body={menu.strings.missingIdentityBody} />
      ) : null}

      {!missingIdentity && expired ? (
        <StatusPanel title={menu.strings.expiredTitle} body={menu.strings.expiredBody} />
      ) : null}

      <section className="menu-grid" aria-label="LifeOS menu">
        {menu.menuItems.map((item) => {
          const title = getLifeOSLocalizedText(item.title, menu.languageCode);
          const description = getLifeOSLocalizedText(item.description, menu.languageCode);
          const imageAlt = getLifeOSLocalizedText(item.imageAlt, menu.languageCode);

          return (
            <a
              className={item.primary ? "menu-card menu-card-primary" : "menu-card"}
              href={item.href}
              key={item.id}
            >
              <div
                aria-label={imageAlt}
                className="menu-card-visual"
                role="img"
                style={{
                  backgroundImage: `${toneBackground[item.tone]}, url(${item.imageSrc})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                <span>{imageAlt}</span>
              </div>
              <div className="menu-card-body">
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </a>
          );
        })}
      </section>

      <section className="quick-actions" aria-label={menu.strings.quickActionsTitle}>
        <h2>{menu.strings.quickActionsTitle}</h2>
        <div className="quick-action-grid">
          {menu.quickActions.map((action) => (
            <a className="quick-action" href={action.href} key={action.id}>
              <strong>{getLifeOSLocalizedText(action.title, menu.languageCode)}</strong>
              <span>{getLifeOSLocalizedText(action.description, menu.languageCode)}</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="trace">
        <span>{menu.strings.traceLabel}</span>
        <code>{context.sessionRef ?? "local-menu-shell"}</code>
      </footer>

      <style>{`
        .lifeos-shell {
          min-height: 100vh;
          padding: 24px;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.92), transparent 34%),
            linear-gradient(180deg, #f7f3ea 0%, #ece7dd 100%);
          color: #1f2723;
          font-family:
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .hero {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          justify-content: space-between;
          max-width: 960px;
          margin: 0 auto 22px;
        }

        .eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #657069;
        }

        h1 {
          margin: 0;
          font-size: clamp(34px, 9vw, 64px);
          line-height: 0.95;
          letter-spacing: -0.06em;
        }

        .subtitle {
          max-width: 620px;
          margin: 12px 0 0;
          color: #59645e;
          font-size: 15px;
          line-height: 1.7;
        }

        .context-pill {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-end;
        }

        .context-pill span {
          border: 1px solid rgba(31,39,35,0.12);
          border-radius: 999px;
          padding: 8px 10px;
          background: rgba(255,255,255,0.66);
          font-size: 12px;
          color: #4f5a54;
        }

        .status-panel {
          max-width: 960px;
          margin: 0 auto 16px;
          border: 1px solid rgba(92,62,42,0.18);
          border-radius: 22px;
          padding: 16px;
          background: rgba(255,248,235,0.88);
        }

        .status-panel h2 {
          margin: 0 0 4px;
          font-size: 16px;
        }

        .status-panel p {
          margin: 0;
          color: #66584c;
          line-height: 1.6;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          max-width: 960px;
          margin: 0 auto;
        }

        .menu-card {
          display: grid;
          min-height: 240px;
          overflow: hidden;
          border: 1px solid rgba(31,39,35,0.10);
          border-radius: 28px;
          background: rgba(255,255,255,0.72);
          color: inherit;
          text-decoration: none;
          box-shadow: 0 18px 60px rgba(42,52,46,0.10);
        }

        .menu-card-primary {
          grid-column: 1 / -1;
          min-height: 280px;
        }

        .menu-card-visual {
          display: flex;
          min-height: 132px;
          align-items: flex-end;
          padding: 16px;
        }

        .menu-card-visual span {
          display: inline-flex;
          max-width: 80%;
          border-radius: 999px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.58);
          color: rgba(31,39,35,0.72);
          font-size: 12px;
          backdrop-filter: blur(8px);
        }

        .menu-card-body {
          padding: 18px;
        }

        .menu-card-body h2 {
          margin: 0 0 8px;
          font-size: 24px;
          letter-spacing: -0.04em;
        }

        .menu-card-body p {
          margin: 0;
          color: #5a645f;
          font-size: 14px;
          line-height: 1.65;
        }

        .quick-actions {
          max-width: 960px;
          margin: 22px auto 0;
        }

        .quick-actions h2 {
          margin: 0 0 10px;
          font-size: 18px;
          letter-spacing: -0.02em;
        }

        .quick-action-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .quick-action {
          display: grid;
          gap: 6px;
          border: 1px solid rgba(31,39,35,0.10);
          border-radius: 18px;
          padding: 14px;
          background: rgba(255,255,255,0.58);
          color: inherit;
          text-decoration: none;
        }

        .quick-action strong {
          font-size: 14px;
        }

        .quick-action span {
          color: #64706a;
          font-size: 12px;
          line-height: 1.5;
        }

        .trace {
          display: flex;
          gap: 8px;
          max-width: 960px;
          margin: 20px auto 0;
          color: #717d75;
          font-size: 12px;
        }

        .trace code {
          overflow-wrap: anywhere;
        }

        @media (max-width: 720px) {
          .lifeos-shell {
            padding: 18px;
          }

          .hero {
            display: grid;
          }

          .context-pill {
            justify-content: flex-start;
          }

          .menu-grid {
            grid-template-columns: 1fr;
          }

          .menu-card-primary {
            grid-column: auto;
          }

          .quick-action-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

function StatusPanel({ title, body }: { readonly title: string; readonly body: string }) {
  return (
    <section className="status-panel" role="status">
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
