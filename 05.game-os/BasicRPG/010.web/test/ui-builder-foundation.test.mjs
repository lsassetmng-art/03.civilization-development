import test from "node:test";
import assert from "node:assert/strict";

import {
  createBuilderController,
  renderBuilderUi
} from "../src/ui-core.mjs";

const bootstrap = Object.freeze({
  permissionBasis: "creator_owner",
  draftCount: 1,
  validationPendingCount: 0,
  submissionPendingCount: 0,
  workspaces: [
    {
      workspaceCode: "gws_001",
      workspaceName: "Boss Workspace",
      defaultLanguageCode: "ja"
    }
  ],
  runtimeProfiles: [
    {
      runtimeProfileCode: "rpg_standard",
      runtimeProfileName: "RPG Standard",
      runtimeFamilyCode: "rpg"
    }
  ],
  templates: [
    {
      templateProfileCode: "rpg_starter",
      templateName: "RPG Starter",
      templateFamilyCode: "starter",
      runtimeFamilyCode: "rpg",
      compatibilityNotes: "Compatible with rpg_standard"
    }
  ],
  recentProjects: [
    {
      projectCode: "gpr_existing",
      projectName: "Existing RPG",
      runtimeFamilyCode: "rpg",
      latestRevisionRef: "grev_existing",
      saveState: "draft"
    }
  ]
});

const createdProject = Object.freeze({
  projectCode: "gpr_001",
  workspaceCode: "gws_001",
  projectName: "Moon Route",
  runtimeFamilyCode: "rpg",
  runtimeProfileCode: "rpg_standard",
  templateProfileCode: "rpg_starter",
  latestRevisionRef: "grev_001",
  latestAutosaveSnapshotRef: null,
  saveState: "draft",
  inlineValidationState: "not_run",
  exportReadinessState: "not_ready",
  publishReadinessState: "not_ready",
  collaborationLockState: "unlocked"
});

test("UI: Builder Home renders recent project and creation actions", async () => {
  const api = {
    loadBootstrap: async () => bootstrap
  };

  const controller = createBuilderController(api);
  await controller.load();

  const html = renderBuilderUi(controller.state);

  assert.match(html, /data-testid="builder-home"/);
  assert.match(html, /Existing RPG/);
  assert.match(html, /Create project/);
  assert.match(html, /Template Gallery/);
  assert.match(html, /Permission: creator_owner/);
});

test("UI: Template Gallery -> create -> Project Overview completes TC-GAME-001 surface flow", async () => {
  let receivedPayload = null;

  const api = {
    loadBootstrap: async () => bootstrap,
    createProject: async (payload) => {
      receivedPayload = payload;
      return createdProject;
    }
  };

  const controller = createBuilderController(api);
  await controller.load();

  controller.openTemplates();
  controller.selectTemplate("rpg_starter");

  let html = renderBuilderUi(controller.state);

  assert.match(html, /data-testid="template-gallery"/);
  assert.match(html, /RPG Starter/);

  controller.beginCreate("rpg_starter");

  html = renderBuilderUi(controller.state);

  assert.match(html, /data-testid="create-project-form"/);
  assert.match(html, /rpg_starter/);
  assert.match(html, /rpg_standard/);

  await controller.createProject({
    payloadVersion: 1,
    commandId: "cmd_game_project_create_001",
    idempotencyKey: "idem_game_project_create_001",
    workspaceCode: "gws_001",
    projectCode: "gpr_001",
    projectName: "Moon Route",
    runtimeFamilyCode: "rpg",
    runtimeProfileCode: "rpg_standard",
    templateFamilyCode: "starter",
    templateProfileCode: "rpg_starter",
    defaultLanguageCode: "ja"
  });

  assert.equal(receivedPayload.projectCode, "gpr_001");

  html = renderBuilderUi(controller.state);

  assert.match(html, /data-testid="project-overview"/);
  assert.match(html, /Moon Route/);
  assert.match(html, /grev_001/);
  assert.match(html, /not_ready/);
});

test("UI: incompatible create remains on create screen and exposes TC-GAME-003 error", async () => {
  const failure = {
    errorCode: "GAME_PROJECT_CREATE_BASIS_INVALID",
    errorMessage: "Runtime profile is not compatible with template profile.",
    errorState: "failed",
    retryAllowed: false
  };

  const api = {
    loadBootstrap: async () => bootstrap,
    createProject: async () => {
      const error = new Error(failure.errorMessage);
      error.payload = failure;
      throw error;
    }
  };

  const controller = createBuilderController(api);
  await controller.load();
  controller.beginCreate("rpg_starter");

  await controller.createProject({
    payloadVersion: 1,
    commandId: "cmd_bad",
    idempotencyKey: "idem_bad",
    workspaceCode: "gws_001",
    projectCode: "gpr_bad",
    projectName: "Bad Basis",
    runtimeFamilyCode: "vn",
    runtimeProfileCode: "rpg_standard",
    templateFamilyCode: "starter",
    templateProfileCode: "rpg_starter",
    defaultLanguageCode: "ja"
  });

  const html = renderBuilderUi(controller.state);

  assert.match(html, /data-testid="create-project-screen"/);
  assert.match(html, /data-testid="builder-error"/);
  assert.match(html, /GAME_PROJECT_CREATE_BASIS_INVALID/);
  assert.doesNotMatch(html, /data-testid="project-overview"/);
});

test("UI: reopen action loads canonical Project Overview read model", async () => {
  const api = {
    loadBootstrap: async () => bootstrap,
    getProject: async (projectCode) => ({
      ...createdProject,
      projectCode,
      projectName: "Reopened Project"
    })
  };

  const controller = createBuilderController(api);
  await controller.load();
  await controller.openProject("gpr_existing");

  const html = renderBuilderUi(controller.state);

  assert.match(html, /data-testid="project-overview"/);
  assert.match(html, /Reopened Project/);
  assert.match(html, /data-testid="revision-summary"/);
});

test("UI: empty Builder Home exposes explicit create-first empty state", async () => {
  const api = {
    loadBootstrap: async () => ({
      ...bootstrap,
      recentProjects: [],
      draftCount: 0
    })
  };

  const controller = createBuilderController(api);
  await controller.load();

  const html = renderBuilderUi(controller.state);

  assert.match(html, /data-testid="empty-projects"/);
  assert.match(html, /No projects yet/);
});
