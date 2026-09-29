import {
  buildMarketplaceDetailViewModel,
  buildMarketplaceListViewModel
} from "../model/app_marketplace_view_model.mjs";

import {
  businessosLocaleCodeToLanguageCode,
  businessosNormalizeLocaleCode,
  businessosReadLoginContextFromBrowser
} from "../../shared/login-context/businessos-login-context.mjs";

import {
  getAppMarketplaceMessages
} from "./app_marketplace_i18n.mjs";

const ROOT_ID = "appMarketplaceRoot";

function resolveLocale(globalObject = globalThis) {
  const envelope = businessosReadLoginContextFromBrowser(globalObject);
  const candidate = envelope &&
    envelope.context &&
    envelope.context.localeCode
      ? envelope.context.localeCode
      : "ja-jp";

  return businessosNormalizeLocaleCode(candidate);
}

function requireProvider(globalObject) {
  const bridge = globalObject.BusinessOSCommonOSProviderBridge;

  if (!bridge || typeof bridge.requireProvider !== "function") {
    throw new Error("BusinessOS CommonOS provider bridge is required");
  }

  return bridge.requireProvider();
}

function applyCommonOsTheme(globalObject) {
  const presenter = globalObject.BusinessOSCommonOSShell;
  const theme = globalObject.BusinessOSCommonOSThemeTokens;

  if (!presenter || typeof presenter.applyTheme !== "function") {
    throw new Error("BusinessOS CommonOS theme presenter is required");
  }

  presenter.applyTheme(theme || {});
}

export function resolveBusinessOsLaunchHref(
  launchTarget,
  baseHref = (
    typeof window !== "undefined" &&
    window.location
      ? window.location.href
      : ""
  )
) {
  if (
    typeof launchTarget !== "string" ||
    launchTarget.length === 0
  ) {
    throw new TypeError("Unsafe BusinessOS launch target");
  }

  if (
    launchTarget.startsWith("/") ||
    launchTarget.includes("%") ||
    launchTarget.includes("\\") ||
    /^[a-z][a-z0-9+.-]*:/i.test(launchTarget) ||
    !/^[A-Za-z0-9._/-]+$/.test(launchTarget)
  ) {
    throw new TypeError("Unsafe BusinessOS launch target");
  }

  const segments = launchTarget.split("/");

  if (
    segments.some(
      (segment) =>
        segment.length === 0 ||
        segment === "." ||
        segment === ".."
    )
  ) {
    throw new TypeError("Unsafe BusinessOS launch target");
  }

  if (
    typeof baseHref !== "string" ||
    baseHref.length === 0
  ) {
    throw new TypeError("Browser base URL is required");
  }

  const base = new URL(baseHref);
  const businessOsRoot = new URL("../../", base);
  const resolved = new URL(
    `../../${launchTarget}`,
    base
  );

  if (
    businessOsRoot.origin !== base.origin ||
    resolved.origin !== base.origin ||
    !resolved.pathname.startsWith(
      businessOsRoot.pathname
    )
  ) {
    throw new TypeError(
      "BusinessOS launch target escaped root"
    );
  }

  return resolved.href;
}

function navigateToLaunchTarget(
  launchTarget,
  globalObject = globalThis
) {
  const href = resolveBusinessOsLaunchHref(
    launchTarget,
    globalObject.location.href
  );

  globalObject.location.assign(href);
}

function assertOpenAction(action) {
  return Boolean(
    action &&
    action.available === true &&
    action.kind === "open_app_entry" &&
    typeof action.launchTarget === "string"
  );
}

function assertInstallHandoff(handoff) {
  return Boolean(
    handoff &&
    handoff.available === true &&
    handoff.kind === "open_pwa_entry_then_browser_install" &&
    handoff.directInstall === false &&
    handoff.deviceInstallTruthOwner === "browser_or_device_os" &&
    typeof handoff.launchTarget === "string"
  );
}

function createMetaRow(
  rt,
  label,
  value,
  statusKind = "info"
) {
  return rt.inline(
    [
      rt.el(
        "span",
        {
          className: "marketplace-meta-label",
          textContent: label
        },
        []
      ),
      rt.statusChip({
        label: value,
        kind: statusKind
      })
    ],
    "marketplace-meta-row"
  );
}

function createActionButton(
  rt,
  label,
  primary,
  onClick
) {
  return rt.button({
    label,
    kind: primary ? "primary" : "secondary",
    onClick
  });
}

function createCardActions(
  rt,
  item,
  messages,
  globalObject,
  detailAction
) {
  const actions = [];

  if (detailAction) {
    actions.push(
      createActionButton(
        rt,
        detailAction.label,
        false,
        detailAction.onClick
      )
    );
  }

  if (assertOpenAction(item.openAction)) {
    actions.push(
      createActionButton(
        rt,
        messages.openAction,
        true,
        () => {
          navigateToLaunchTarget(
            item.openAction.launchTarget,
            globalObject
          );
        }
      )
    );
  }

  if (assertInstallHandoff(item.installHandoff)) {
    actions.push(
      createActionButton(
        rt,
        messages.addToDeviceAction,
        false,
        () => {
          navigateToLaunchTarget(
            item.installHandoff.launchTarget,
            globalObject
          );
        }
      )
    );
  }

  return rt.inline(
    actions,
    "marketplace-actions"
  );
}

function createMarketplaceCard(
  provider,
  item,
  messages,
  globalObject,
  detailAction
) {
  const rt = provider.runtime;

  const body = rt.stack(
    [
      createMetaRow(
        rt,
        messages.runtimeRegistrationLabel,
        item.runtimeRegistrationStatus === "registered"
          ? messages.registeredLabel
          : item.runtimeRegistrationStatus,
        item.runtimeRegistrationStatus === "registered"
          ? "success"
          : "muted"
      ),
      createMetaRow(
        rt,
        messages.pwaCapableLabel,
        item.pwaCapable
          ? messages.pwaAvailableLabel
          : "-",
        item.pwaCapable
          ? "success"
          : "muted"
      ),
      createCardActions(
        rt,
        item,
        messages,
        globalObject,
        detailAction
      )
    ],
    "marketplace-card-body"
  );

  return rt.card({
    title: item.appName,
    body
  });
}

function createShell(
  provider,
  messages,
  sectionTitle,
  sectionBody
) {
  return provider.shell.createShell({
    title: messages.pageTitle,
    subtitle: "BusinessOS",
    navItems: [
      {
        label: messages.pageTitle,
        href: "#",
        current: true
      }
    ],
    heroTitle: messages.pageTitle,
    heroCopy: messages.pageLead,
    sections: [
      {
        title: sectionTitle,
        body: sectionBody
      }
    ]
  });
}

function mountShell(
  root,
  provider,
  messages,
  sectionTitle,
  sectionBody
) {
  const shellNode = createShell(
    provider,
    messages,
    sectionTitle,
    sectionBody
  );

  root.replaceChildren(shellNode);
  root.setAttribute(
    "data-commonos-provider-connected",
    "true"
  );

  return shellNode;
}

function renderList(
  root,
  localeCode,
  messages,
  globalObject,
  provider
) {
  const rt = provider.runtime;
  const listView = buildMarketplaceListViewModel();

  const cards = listView.map((item) =>
    createMarketplaceCard(
      provider,
      item,
      messages,
      globalObject,
      {
        label: messages.detailsAction,
        onClick: () => {
          renderDetail(
            root,
            item.appCode,
            localeCode,
            messages,
            globalObject,
            provider
          );
        }
      }
    )
  );

  const listBody = rt.stack(
    cards,
    "marketplace-grid"
  );

  mountShell(
    root,
    provider,
    messages,
    messages.pageTitle,
    listBody
  );
}

function renderDetail(
  root,
  appCode,
  localeCode,
  messages,
  globalObject,
  provider
) {
  const rt = provider.runtime;
  const item = buildMarketplaceDetailViewModel(appCode);

  if (!item) {
    renderList(
      root,
      localeCode,
      messages,
      globalObject,
      provider
    );
    return;
  }

  const detailCard = createMarketplaceCard(
    provider,
    item,
    messages,
    globalObject,
    {
      label: messages.backToListAction,
      onClick: () => {
        renderList(
          root,
          localeCode,
          messages,
          globalObject,
          provider
        );
      }
    }
  );

  const detailBody = rt.stack(
    [
      detailCard,
      rt.panelNote(messages.installHandoffNote)
    ],
    "marketplace-detail"
  );

  mountShell(
    root,
    provider,
    messages,
    item.appName,
    detailBody
  );
}

export function startAppMarketplace(
  globalObject = globalThis
) {
  const browserDocument =
    globalObject &&
    globalObject.document
      ? globalObject.document
      : null;

  if (!browserDocument) {
    return false;
  }

  const root = browserDocument.getElementById(ROOT_ID);

  if (!root) {
    return false;
  }

  const localeCode = resolveLocale(globalObject);
  const languageCode =
    businessosLocaleCodeToLanguageCode(localeCode);
  const messages =
    getAppMarketplaceMessages(localeCode);

  browserDocument.documentElement.lang = languageCode;
  browserDocument.title = messages.documentTitle;

  const provider = requireProvider(globalObject);

  applyCommonOsTheme(globalObject);

  renderList(
    root,
    localeCode,
    messages,
    globalObject,
    provider
  );

  return true;
}

if (
  typeof window !== "undefined" &&
  typeof document !== "undefined"
) {
  startAppMarketplace(window);
}
