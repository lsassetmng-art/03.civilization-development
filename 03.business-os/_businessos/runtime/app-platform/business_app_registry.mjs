function freezePwaCapability(value) {
  return Object.freeze({
    manifest_present: value.manifest_present,
    manifest_path: value.manifest_path,
    start_url: value.start_url,
    scope: value.scope,
    display: value.display,
    device_install_truth_owner: value.device_install_truth_owner
  });
}

function freezeApp(value) {
  return Object.freeze({
    business_app_id: value.business_app_id,
    app_code: value.app_code,
    app_name: value.app_name,
    app_state: value.app_state,
    app_category: value.app_category,
    owner_type: value.owner_type,
    owner_id: value.owner_id,
    runtime_registration_status: value.runtime_registration_status,
    launch_target: value.launch_target,
    pwa_capability: freezePwaCapability(value.pwa_capability)
  });
}

/*
 * Canonical business_app fields whose persisted values have not yet been
 * audited are deliberately null rather than invented here.
 *
 * app_code is the runtime lookup key until canonical persisted
 * business_app_id values are connected.
 */
export const BUSINESS_APP_REGISTRY = Object.freeze([
  freezeApp({
    business_app_id: null,
    app_code: "PocketSecretary",
    app_name: "PocketSecretary",
    app_state: null,
    app_category: null,
    owner_type: null,
    owner_id: null,
    runtime_registration_status: "registered",
    launch_target: "PocketSecretary/web/index.html",
    pwa_capability: {
      manifest_present: true,
      manifest_path: "PocketSecretary/web/manifest.webmanifest",
      start_url: "./index.html",
      scope: "./",
      display: "standalone",
      device_install_truth_owner: "browser_or_device_os"
    }
  }),

  freezeApp({
    business_app_id: null,
    app_code: "NameCardManager",
    app_name: "NameCardManager",
    app_state: null,
    app_category: null,
    owner_type: null,
    owner_id: null,
    runtime_registration_status: "registered",
    launch_target: "NameCardManager/web/index.html",
    pwa_capability: {
      manifest_present: true,
      manifest_path: "NameCardManager/web/manifest.webmanifest",
      start_url: "./index.html",
      scope: "./",
      display: "standalone",
      device_install_truth_owner: "browser_or_device_os"
    }
  }),

  freezeApp({
    business_app_id: null,
    app_code: "CasualChatWorker",
    app_name: "CasualChatWorker",
    app_state: null,
    app_category: null,
    owner_type: null,
    owner_id: null,
    runtime_registration_status: "registered",
    launch_target: "CasualChatWorker/app/index.html",
    pwa_capability: {
      manifest_present: true,
      manifest_path: "CasualChatWorker/app/manifest.webmanifest",
      start_url: "./index.html",
      scope: "./",
      display: "standalone",
      device_install_truth_owner: "browser_or_device_os"
    }
  }),

  freezeApp({
    business_app_id: null,
    app_code: "AIOperationDesk",
    app_name: "AI Operation Desk",
    app_state: null,
    app_category: null,
    owner_type: null,
    owner_id: null,
    runtime_registration_status: "registered",
    launch_target: "AIOperationDesk/030.frontend/web/index.html",
    pwa_capability: {
      manifest_present: true,
      manifest_path: "AIOperationDesk/030.frontend/web/manifest.webmanifest",
      start_url: "./index.html",
      scope: "./",
      display: "standalone",
      device_install_truth_owner: "browser_or_device_os"
    }
  })
]);

export function listBusinessApps() {
  return BUSINESS_APP_REGISTRY;
}

export function getBusinessApp(appCode) {
  if (typeof appCode !== "string" || appCode.trim() === "") {
    return null;
  }

  const normalized = appCode.trim();

  return (
    BUSINESS_APP_REGISTRY.find(
      (app) => app.app_code === normalized
    ) || null
  );
}
