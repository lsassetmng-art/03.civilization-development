import {
  getMarketplaceApp,
  listMarketplaceApps
} from "../runtime/app_marketplace_adapter.mjs";

function buildItem(app) {
  if (!app) {
    return null;
  }

  const openAction = Object.freeze({
    available: app.openAction.available === true,
    kind: app.openAction.kind,
    launchTarget: app.openAction.launchTarget
  });

  const installHandoff = Object.freeze({
    available: app.installHandoff.available === true,
    kind: app.installHandoff.kind,
    launchTarget: app.installHandoff.launchTarget,
    directInstall: false,
    deviceInstallTruthOwner:
      app.installHandoff.deviceInstallTruthOwner
  });

  return Object.freeze({
    appCode: app.appCode,
    appName: app.appName,
    runtimeRegistrationStatus:
      app.runtimeRegistrationStatus,
    launchTarget: app.launchTarget,
    pwaCapable: app.pwaCapability.capable === true,
    openAction,
    installHandoff
  });
}

export function buildMarketplaceListViewModel() {
  return Object.freeze(
    listMarketplaceApps()
      .map(buildItem)
      .filter(Boolean)
  );
}

export function buildMarketplaceDetailViewModel(appCode) {
  return buildItem(
    getMarketplaceApp(appCode)
  );
}
