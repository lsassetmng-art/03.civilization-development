import {
  getApp as getRegisteredApp
} from "../../_businessos/runtime/app-platform/business_app_runtime.mjs";

export const PUBLIC_MARKETPLACE_APP_CODES = Object.freeze([
  "PocketSecretary",
  "NameCardManager",
  "CasualChatWorker",
  "AIOperationDesk"
]);

const EXPECTED_LAUNCH_TARGETS = Object.freeze({
  PocketSecretary: "PocketSecretary/web/index.html",
  NameCardManager: "NameCardManager/web/index.html",
  CasualChatWorker: "CasualChatWorker/app/index.html",
  AIOperationDesk: "AIOperationDesk/030.frontend/web/index.html"
});

function isSafeLaunchTarget(appCode, launchTarget) {
  if (
    typeof appCode !== "string" ||
    typeof launchTarget !== "string"
  ) {
    return false;
  }

  const expected = EXPECTED_LAUNCH_TARGETS[appCode];

  if (!expected || launchTarget !== expected) {
    return false;
  }

  if (
    launchTarget.startsWith("/") ||
    launchTarget.includes("..") ||
    /^[a-z][a-z0-9+.-]*:/i.test(launchTarget)
  ) {
    return false;
  }

  return true;
}

function projectMarketplaceApp(app) {
  if (!app || typeof app !== "object") {
    return null;
  }

  if (!PUBLIC_MARKETPLACE_APP_CODES.includes(app.app_code)) {
    return null;
  }

  if (app.runtime_registration_status !== "registered") {
    return null;
  }

  if (!isSafeLaunchTarget(app.app_code, app.launch_target)) {
    return null;
  }

  const pwa = (
    app.pwa_capability &&
    typeof app.pwa_capability === "object"
  )
    ? app.pwa_capability
    : {};

  const pwaCapable = pwa.manifest_present === true;

  if (
    pwaCapable &&
    pwa.device_install_truth_owner !== "browser_or_device_os"
  ) {
    return null;
  }

  const pwaCapability = Object.freeze({
    capable: pwaCapable,
    manifestPresent: pwa.manifest_present === true,
    display:
      typeof pwa.display === "string"
        ? pwa.display
        : null,
    deviceInstallTruthOwner:
      pwa.device_install_truth_owner === "browser_or_device_os"
        ? "browser_or_device_os"
        : null
  });

  const openAction = Object.freeze({
    available: true,
    kind: "open_app_entry",
    launchTarget: app.launch_target
  });

  const installHandoff = Object.freeze({
    available: pwaCapable,
    kind: "open_pwa_entry_then_browser_install",
    launchTarget: app.launch_target,
    directInstall: false,
    deviceInstallTruthOwner: "browser_or_device_os"
  });

  return Object.freeze({
    appCode: app.app_code,
    appName: app.app_name,
    runtimeRegistrationStatus: app.runtime_registration_status,
    launchTarget: app.launch_target,
    pwaCapability,
    openAction,
    installHandoff
  });
}

export function listMarketplaceApps() {
  const projected = [];

  for (const appCode of PUBLIC_MARKETPLACE_APP_CODES) {
    const app = projectMarketplaceApp(
      getRegisteredApp(appCode)
    );

    if (app) {
      projected.push(app);
    }
  }

  return Object.freeze(projected);
}

export function getMarketplaceApp(appCode) {
  if (
    typeof appCode !== "string" ||
    !PUBLIC_MARKETPLACE_APP_CODES.includes(appCode.trim())
  ) {
    return null;
  }

  return projectMarketplaceApp(
    getRegisteredApp(appCode.trim())
  );
}
