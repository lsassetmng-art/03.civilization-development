import test from "node:test";
import assert from "node:assert/strict";

import {
  buildInitialProjectState,
  compareIdempotentReplay,
  validateCreateProjectRequest
} from "../src/m01-builder-foundation.mjs";

const validRequest = Object.freeze({
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

const validBasis = Object.freeze({
  workspace: {
    workspaceCode: "gws_001"
  },
  runtimeProfile: {
    runtimeProfileCode: "rpg_standard",
    runtimeFamilyCode: "rpg"
  },
  templateProfile: {
    templateProfileCode: "rpg_starter",
    templateFamilyCode: "starter",
    runtimeFamilyCode: "rpg"
  }
});

test("TC-GAME-001: valid basis passes and initial revision state is revision 1", () => {
  const validation = validateCreateProjectRequest(validRequest, validBasis);

  assert.equal(validation.ok, true);
  assert.deepEqual(validation.errors, []);

  const state = buildInitialProjectState({
    ...validRequest,
    latestRevisionRef: "grev_001"
  });

  assert.equal(state.revisionNo, 1);
  assert.equal(state.latestRevisionRef, "grev_001");
  assert.equal(state.latestAutosaveSnapshotRef, null);
  assert.equal(state.saveState, "draft");
  assert.equal(state.exportReadinessState, "not_ready");
});

test("TC-GAME-002: identical replay is stable and changed payload conflicts", () => {
  assert.equal(
    compareIdempotentReplay(validRequest, { ...validRequest }),
    "same_intent"
  );

  assert.equal(
    compareIdempotentReplay(validRequest, {
      ...validRequest,
      projectName: "Different Project"
    }),
    "conflict"
  );
});

test("TC-GAME-003: incompatible template/runtime basis is rejected explicitly", () => {
  const validation = validateCreateProjectRequest(validRequest, {
    ...validBasis,
    templateProfile: {
      templateProfileCode: "rpg_starter",
      templateFamilyCode: "starter",
      runtimeFamilyCode: "vn"
    }
  });

  assert.equal(validation.ok, false);
  assert.equal(
    validation.errors.some(
      (item) =>
        item.field === "templateProfileCode" &&
        item.code === "template_runtime_incompatible"
    ),
    true
  );
});
