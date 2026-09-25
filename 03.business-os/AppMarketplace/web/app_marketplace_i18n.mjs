const JA_JP = Object.freeze({
  documentTitle: "App Marketplace | BusinessOS",
  pageTitle: "App Marketplace",
  pageLead: "BusinessOSで利用できるアプリを確認し、アプリを開くか端末追加の入口へ進めます。",
  runtimeRegistrationLabel: "ランタイム登録",
  registeredLabel: "登録済み",
  pwaCapableLabel: "端末追加",
  pwaAvailableLabel: "対応",
  detailsAction: "詳細",
  openAction: "開く",
  addToDeviceAction: "端末に追加",
  installHandoffNote: "対象アプリを開きます。追加可否と追加操作はブラウザまたは端末側で行います。",
  backToListAction: "一覧へ戻る"
});

const EN_US = Object.freeze({
  documentTitle: "App Marketplace | BusinessOS",
  pageTitle: "App Marketplace",
  pageLead: "Browse BusinessOS apps, open an app, or continue to its add-to-device entry.",
  runtimeRegistrationLabel: "Runtime registration",
  registeredLabel: "Registered",
  pwaCapableLabel: "Add to device",
  pwaAvailableLabel: "Available",
  detailsAction: "Details",
  openAction: "Open",
  addToDeviceAction: "Add to device",
  installHandoffNote: "This opens the app entry. Availability and the add-to-device flow are handled by the browser or device.",
  backToListAction: "Back to list"
});

export const APP_MARKETPLACE_MESSAGES = Object.freeze({
  "ja-jp": JA_JP,
  "en-us": EN_US
});

export function getAppMarketplaceMessages(localeCode) {
  return APP_MARKETPLACE_MESSAGES[localeCode] || APP_MARKETPLACE_MESSAGES["ja-jp"];
}
