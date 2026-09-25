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

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined && text !== null) {
    element.textContent = String(text);
  }

  return element;
}

function resolveLocale(globalObject = globalThis) {
  const envelope = businessosReadLoginContextFromBrowser(globalObject);
  const candidate = envelope &&
    envelope.context &&
    envelope.context.localeCode
    ? envelope.context.localeCode
    : "ja-jp";

  return businessosNormalizeLocaleCode(candidate);
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

  /*
   * launchTarget comes from the audited R15B1 projection.
   *
   * Keep the browser-facing resolver fail-closed as a second
   * boundary. Percent encoding and backslashes are rejected
   * entirely so encoded dot/slash/backslash forms cannot gain
   * different semantics during URL or server normalization.
   */
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

function navigateToLaunchTarget(launchTarget) {
  const href = resolveBusinessOsLaunchHref(launchTarget);
  window.location.assign(href);
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

function appendMetaRow(container, label, value) {
  const row = createElement(
    "div",
    "businessos-commonos-meta marketplace-meta-row"
  );

  const key = createElement(
    "span",
    "marketplace-meta-key",
    label
  );

  const separator = document.createTextNode(": ");
  const content = createElement(
    "span",
    "marketplace-meta-value",
    value
  );

  row.append(key, separator, content);
  container.append(row);
}

function createActionButton(label, primary = false) {
  const button = createElement(
    "button",
    primary
      ? "marketplace-button marketplace-button-primary"
      : "marketplace-button",
    label
  );

  button.type = "button";
  return button;
}

function renderHeader(messages) {
  const header = createElement(
    "header",
    "businessos-commonos-header marketplace-header"
  );

  header.append(
    createElement("h1", "marketplace-title", messages.pageTitle),
    createElement("p", "marketplace-lead", messages.pageLead)
  );

  return header;
}

function renderList(root, localeCode, messages) {
  const listView = buildMarketplaceListViewModel();

  const main = createElement(
    "main",
    "businessos-commonos-shell marketplace-shell"
  );

  main.append(renderHeader(messages));

  const panel = createElement(
    "section",
    "businessos-commonos-panel businessos-commonos-panel-wide marketplace-panel"
  );

  const list = createElement(
    "div",
    "businessos-commonos-list marketplace-list"
  );

  for (const item of listView) {
    const card = createElement(
      "article",
      "businessos-commonos-card marketplace-card"
    );

    const heading = createElement(
      "h2",
      "marketplace-card-title",
      item.appName
    );

    card.append(heading);

    appendMetaRow(
      card,
      messages.runtimeRegistrationLabel,
      item.runtimeRegistrationStatus === "registered"
        ? messages.registeredLabel
        : item.runtimeRegistrationStatus
    );

    appendMetaRow(
      card,
      messages.pwaCapableLabel,
      item.pwaCapable
        ? messages.pwaAvailableLabel
        : "-"
    );

    const actions = createElement(
      "div",
      "marketplace-actions"
    );

    const detailsButton = createActionButton(
      messages.detailsAction
    );

    detailsButton.addEventListener("click", () => {
      renderDetail(root, item.appCode, localeCode, messages);
    });

    actions.append(detailsButton);

    if (assertOpenAction(item.openAction)) {
      const openButton = createActionButton(
        messages.openAction,
        true
      );

      openButton.addEventListener("click", () => {
        navigateToLaunchTarget(item.openAction.launchTarget);
      });

      actions.append(openButton);
    }

    if (assertInstallHandoff(item.installHandoff)) {
      const installButton = createActionButton(
        messages.addToDeviceAction
      );

      installButton.addEventListener("click", () => {
        navigateToLaunchTarget(
          item.installHandoff.launchTarget
        );
      });

      actions.append(installButton);
    }

    card.append(actions);
    list.append(card);
  }

  panel.append(list);
  main.append(panel);
  root.replaceChildren(main);
}

function renderDetail(root, appCode, localeCode, messages) {
  const item = buildMarketplaceDetailViewModel(appCode);

  if (!item) {
    renderList(root, localeCode, messages);
    return;
  }

  const main = createElement(
    "main",
    "businessos-commonos-shell marketplace-shell"
  );

  main.append(renderHeader(messages));

  const panel = createElement(
    "section",
    "businessos-commonos-panel businessos-commonos-panel-wide marketplace-panel marketplace-detail"
  );

  panel.append(
    createElement(
      "h2",
      "marketplace-detail-title",
      item.appName
    )
  );

  appendMetaRow(
    panel,
    messages.runtimeRegistrationLabel,
    item.runtimeRegistrationStatus === "registered"
      ? messages.registeredLabel
      : item.runtimeRegistrationStatus
  );

  appendMetaRow(
    panel,
    messages.pwaCapableLabel,
    item.pwaCapable
      ? messages.pwaAvailableLabel
      : "-"
  );

  const note = createElement(
    "p",
    "businessos-commonos-meta marketplace-handoff-note",
    messages.installHandoffNote
  );

  panel.append(note);

  const actions = createElement(
    "div",
    "marketplace-actions"
  );

  const backButton = createActionButton(
    messages.backToListAction
  );

  backButton.addEventListener("click", () => {
    renderList(root, localeCode, messages);
  });

  actions.append(backButton);

  if (assertOpenAction(item.openAction)) {
    const openButton = createActionButton(
      messages.openAction,
      true
    );

    openButton.addEventListener("click", () => {
      navigateToLaunchTarget(item.openAction.launchTarget);
    });

    actions.append(openButton);
  }

  if (assertInstallHandoff(item.installHandoff)) {
    const installButton = createActionButton(
      messages.addToDeviceAction
    );

    installButton.addEventListener("click", () => {
      navigateToLaunchTarget(
        item.installHandoff.launchTarget
      );
    });

    actions.append(installButton);
  }

  panel.append(actions);
  main.append(panel);
  root.replaceChildren(main);
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

  renderList(root, localeCode, messages);
  return true;
}

if (
  typeof window !== "undefined" &&
  typeof document !== "undefined"
) {
  startAppMarketplace(window);
}
