import { BuilderApiClient } from "./api-client.mjs";
import {
  createBuilderController,
  renderBuilderUi
} from "./ui-core.mjs";

function uuid() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formPayload(form) {
  const data = new FormData(form);

  const runtimeProfileCode = String(data.get("runtimeProfileCode") || "");
  const runtimeFamilyCode = String(data.get("runtimeFamilyCode") || "");

  return {
    payloadVersion: 1,
    commandId: `cmd_game_project_create_${uuid()}`,
    idempotencyKey: `idem_game_project_create_${uuid()}`,
    workspaceCode: String(data.get("workspaceCode") || ""),
    projectCode: String(data.get("projectCode") || ""),
    projectName: String(data.get("projectName") || ""),
    runtimeFamilyCode,
    runtimeProfileCode,
    templateFamilyCode:
      String(data.get("templateFamilyCode") || "") || null,
    templateProfileCode:
      String(data.get("templateProfileCode") || "") || null,
    defaultLanguageCode:
      String(data.get("defaultLanguageCode") || "ja")
  };
}

export function mountBuilderApp(root, {
  api = new BuilderApiClient()
} = {}) {
  if (!root) {
    throw new Error("Builder root element is required");
  }

  const render = (state) => {
    root.innerHTML = renderBuilderUi(state);
  };

  const controller = createBuilderController(api, render);

  root.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    const action = button.dataset.action;

    if (action === "back-home") {
      controller.openHome();
      return;
    }

    if (action === "open-templates") {
      controller.openTemplates();
      return;
    }

    if (action === "open-create") {
      controller.beginCreate();
      return;
    }

    if (action === "select-template") {
      controller.selectTemplate(button.dataset.templateCode);
      return;
    }

    if (action === "create-with-template") {
      controller.beginCreate(button.dataset.templateCode);
      return;
    }

    if (action === "open-project") {
      await controller.openProject(button.dataset.projectCode);
    }
  });

  root.addEventListener("submit", async (event) => {
    if (event.target.id !== "create-project-form") {
      return;
    }

    event.preventDefault();
    await controller.createProject(formPayload(event.target));
  });

  render(controller.state);
  void controller.load();

  return controller;
}

const root = document.querySelector("#game-builder-root");

if (root) {
  mountBuilderApp(root);
}
