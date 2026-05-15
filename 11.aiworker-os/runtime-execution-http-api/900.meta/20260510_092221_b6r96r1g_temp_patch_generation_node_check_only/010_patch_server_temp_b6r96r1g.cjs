const fs = require("fs");

const [,, serverPath, patchedPath] = process.argv;
if (!serverPath || !patchedPath) {
  console.error("usage: node patch serverPath patchedPath");
  process.exit(2);
}

let src = fs.readFileSync(serverPath, "utf8");

if (src.includes("AIW_B6R96R1G_MINIMUM_DELIVERABLE_HELPER_START")) {
  throw new Error("B6R96R1G_MARKER_ALREADY_EXISTS");
}

const helper = `
// AIW_B6R96R1G_MINIMUM_DELIVERABLE_HELPER_START
function aiwB6R96R1GText(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function aiwB6R96R1GFirstText(values) {
  for (const value of values) {
    const text = aiwB6R96R1GText(value);
    if (text) return text;
  }
  return "";
}

function aiwB6R96R1GObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function aiwB6R96R1GPick(payload, names) {
  payload = aiwB6R96R1GObject(payload);
  for (const name of names) {
    const text = aiwB6R96R1GText(payload[name]);
    if (text) return text;
  }
  return "";
}

function aiwB6R96R1GNormalizeRoleCode(payload, appPayload) {
  const raw = aiwB6R96R1GFirstText([
    aiwB6R96R1GPick(payload, ["role_code", "worker_role_code", "placement_role_code"]),
    aiwB6R96R1GPick(appPayload, ["role_code", "worker_role_code", "placement_role_code"]),
    aiwB6R96R1GPick(payload, ["model_code", "aiworker_model_code"]),
    aiwB6R96R1GPick(appPayload, ["model_code", "aiworker_model_code"])
  ]).toLowerCase();

  if (raw.includes("president") || raw.includes("r5p")) return "president";
  if (raw.includes("manager") || raw.includes("r5")) return "manager";
  if (raw.includes("leader") || raw.includes("r4")) return "leader";
  if (raw.includes("worker") || raw.includes("r3")) return "worker";
  if (raw.includes("helper") || raw.includes("r1")) return "helper";
  if (raw.includes("friend")) return "friend";
  if (raw.includes("lover")) return "lover";
  return "worker";
}

function aiwB6R96R1GCapabilityTier(payload, appPayload) {
  const model = aiwB6R96R1GFirstText([
    aiwB6R96R1GPick(payload, ["model_code", "aiworker_model_code"]),
    aiwB6R96R1GPick(appPayload, ["model_code", "aiworker_model_code"])
  ]).toLowerCase();

  if (model.includes("byd2-003") || model.includes("hd-r5p") || model.includes("hd-r5")) return "high";
  if (model.includes("byd2-002") || model.includes("hd-r4")) return "standard";
  if (model.includes("byd1-003") || model.includes("hd-r3")) return "standard_basic";
  if (model.includes("hd-r1c") || model.includes("hd-r1a") || model.includes("friend") || model.includes("lover")) return "basic_stable";
  return "standard_basic";
}

function aiwB6R96R1GReferenceProfile(tier) {
  if (tier === "high") {
    return {
      reference_depth: "deep",
      reference_scope: "broad_verified_cx",
      stability_level: "high",
      originality_level: "high",
      specialty_level: "high",
      prediction_level: "high",
      review_depth: "advanced"
    };
  }

  if (tier === "standard") {
    return {
      reference_depth: "standard",
      reference_scope: "standard_cx",
      stability_level: "standard",
      originality_level: "medium",
      specialty_level: "medium",
      prediction_level: "medium",
      review_depth: "standard"
    };
  }

  if (tier === "basic_stable") {
    return {
      reference_depth: "lightweight",
      reference_scope: "lightweight_reference_or_legacy_seed",
      stability_level: "standard",
      originality_level: "low",
      specialty_level: "low",
      prediction_level: "basic",
      review_depth: "basic"
    };
  }

  return {
    reference_depth: "standard_light",
    reference_scope: "standard_limited_cx",
    stability_level: "standard",
    originality_level: "medium_low",
    specialty_level: "medium_low",
    prediction_level: "basic",
    review_depth: "basic"
  };
}

function aiwB6R96R1GBuildBody(role, title, instruction, tier, referenceProfile) {
  const safeTitle = title || "AIWorkerOS成果物";
  const safeInstruction = instruction || "入力指示が不足しています。";
  const cxNote = "参照範囲: " + referenceProfile.reference_depth + " / " + referenceProfile.reference_scope;

  if (!instruction) {
    return [
      "# 作業不能理由レポート",
      "",
      "## 結論",
      "現時点では通常成果物を完成できませんが、最低保証として不足情報レポートを返します。",
      "",
      "## 理由",
      "作業指示または成果物条件が不足しています。",
      "",
      "## 不足情報",
      "- 目的",
      "- 対象範囲",
      "- 期待する成果物形式",
      "- 判断に必要な前提",
      "",
      "## 次に必要な入力",
      "上記の不足情報を追加してください。",
      "",
      "## 参照制約",
      cxNote
    ].join("\\n");
  }

  if (role === "president") {
    return [
      "# " + safeTitle,
      "",
      "## 目的",
      safeInstruction,
      "",
      "## 方針案",
      "現時点の情報から、実行可能な基本方針を整理します。",
      "",
      "## 優先順位",
      "1. 目的と制約の確認",
      "2. 実行範囲の整理",
      "3. Managerへ渡す大項目の明確化",
      "",
      "## 成功条件",
      "次工程のManagerが大項目へ分解できる状態にすること。",
      "",
      "## 制約",
      cxNote,
      "",
      "## 次工程",
      "Managerへ方針を渡し、大項目分解を行ってください。"
    ].join("\\n");
  }

  if (role === "manager") {
    return [
      "# " + safeTitle,
      "",
      "## 全体方針",
      safeInstruction,
      "",
      "## 大項目分解案",
      "- 目的整理",
      "- 成果物整理",
      "- 実行範囲整理",
      "- 担当/役割候補整理",
      "- レビュー観点整理",
      "",
      "## Leaderへ渡す観点",
      "各大項目を作業単位へ分解できるよう、目的、入力、成果物、制約を渡します。",
      "",
      "## 注意点",
      cxNote,
      "",
      "## 次工程",
      "Leaderが中項目と作業単位へ分解してください。"
    ].join("\\n");
  }

  if (role === "leader") {
    return [
      "# " + safeTitle,
      "",
      "## 対象",
      safeInstruction,
      "",
      "## 作業単位候補",
      "- 入力確認",
      "- 成果物構成作成",
      "- 本文作成",
      "- 品質確認",
      "- 納品準備",
      "",
      "## Workerへの引き渡し",
      "作業目的、期待成果物、制約、確認観点を明示して渡します。",
      "",
      "## 注意点",
      cxNote,
      "",
      "## 次工程",
      "Workerが成果物本文を作成してください。"
    ].join("\\n");
  }

  return [
    "# " + safeTitle,
    "",
    "## 概要",
    safeInstruction,
    "",
    "## 本文",
    "依頼内容に基づき、標準的で安定した成果物を作成します。",
    "",
    "### 主要ポイント",
    "- 目的を整理する",
    "- 必要な内容を章立てする",
    "- 確認ポイントを明示する",
    "- 次工程を示す",
    "",
    "## 確認ポイント",
    "- 目的に合っているか",
    "- 不足情報が残っていないか",
    "- 次工程に進めるか",
    "",
    "## 未解決事項",
    "追加情報があれば、より専門的で独自性のある成果物にできます。",
    "",
    "## 参照制約",
    cxNote,
    "",
    "## 次工程",
    "必要に応じて上位ロボットまたは専門ロボットで深掘りしてください。"
  ].join("\\n");
}

function aiwB6R96R1GBuildRequesterDeliveryPayload(payload) {
  payload = aiwB6R96R1GObject(payload);
  const appPayload = aiwB6R96R1GObject(
    payload.app_read_payload_jsonb ||
    payload.app_read_payload ||
    payload.payload ||
    payload.request_payload ||
    {}
  );

  const title = aiwB6R96R1GFirstText([
    aiwB6R96R1GPick(payload, ["task_title", "title", "request_title"]),
    aiwB6R96R1GPick(appPayload, ["task_title", "title", "request_title"]),
    "AIWorkerOS成果物"
  ]);

  const instruction = aiwB6R96R1GFirstText([
    aiwB6R96R1GPick(payload, ["task_instruction_ja", "instruction", "prompt", "task_description"]),
    aiwB6R96R1GPick(appPayload, ["task_instruction_ja", "instruction", "prompt", "task_description"])
  ]);

  const role = aiwB6R96R1GNormalizeRoleCode(payload, appPayload);
  const tier = aiwB6R96R1GCapabilityTier(payload, appPayload);
  const referenceProfile = aiwB6R96R1GReferenceProfile(tier);
  const body = aiwB6R96R1GBuildBody(role, title, instruction, tier, referenceProfile);

  return {
    contract_version: "requester_deliverable_v1",
    deliverable_title: title,
    deliverable_kind: role === "president" ? "policy_proposal" : role === "manager" ? "major_breakdown" : role === "leader" ? "task_decomposition" : "document",
    body_format: "markdown",
    body_markdown: body,
    summary_text: role + " role produced a stable minimum deliverable.",
    limitations_text: "Performance differences are controlled by CX reference permission and capability profile. Low performance still returns stable output.",
    unresolved_issues_text: instruction ? "" : "Task instruction is missing or insufficient.",
    next_steps_text: "Review the deliverable and provide additional constraints if deeper specialty or originality is required.",
    minimum_guarantee_status: body ? "satisfied" : "blocking_report",
    performance_profile: {
      capability_tier: tier,
      stability_level: referenceProfile.stability_level,
      originality_level: referenceProfile.originality_level,
      specialty_level: referenceProfile.specialty_level,
      prediction_level: referenceProfile.prediction_level,
      review_depth: referenceProfile.review_depth
    },
    reference_usage_profile: referenceProfile,
    generation_basis: {
      role_code: role,
      task_title: title,
      has_instruction: Boolean(instruction),
      generated_by: "AIW_B6R96R1G_MINIMUM_DELIVERABLE_HELPER"
    }
  };
}

function aiwB6R96R1GEnsureRequesterDeliveryPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;

  const current = aiwB6R96R1GObject(payload.requester_delivery_payload);
  if (aiwB6R96R1GText(current.body_markdown) || aiwB6R96R1GText(current.body_text)) {
    return payload;
  }

  const statusText = aiwB6R96R1GFirstText([
    payload.request_status_code,
    payload.status_code,
    payload.status,
    payload.result
  ]);

  const looksRuntime =
    Boolean(payload.request_id) ||
    Boolean(payload.runtime_request_id) ||
    Boolean(payload.app_read_payload_jsonb) ||
    Boolean(payload.app_read_payload) ||
    Boolean(payload.payload) ||
    /REQUESTED|ACCEPTED|accepted|ok/i.test(statusText);

  if (!looksRuntime) return payload;

  payload.requester_delivery_payload = aiwB6R96R1GBuildRequesterDeliveryPayload(payload);
  payload.deliverable = payload.requester_delivery_payload;

  return payload;
}
// AIW_B6R96R1G_MINIMUM_DELIVERABLE_HELPER_END

`;

function findSendJsonFunction(source) {
  const re = /function\\s+sendJson\\s*\\(([^)]*)\\)\\s*\\{/m;
  const match = re.exec(source);
  if (!match) return null;

  const args = match[1].split(",").map((v) => v.trim()).filter(Boolean);
  const payloadArg = args[args.length - 1];

  if (!payloadArg || !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(payloadArg)) {
    throw new Error("SENDJSON_PAYLOAD_ARG_UNSAFE:" + String(payloadArg));
  }

  return {
    start: match.index,
    insertAt: match.index + match[0].length,
    payloadArg
  };
}

const sendJsonInfo = findSendJsonFunction(src);
if (!sendJsonInfo) {
  throw new Error("SENDJSON_FUNCTION_NOT_FOUND");
}

const helperInsertPoint = sendJsonInfo.start;
src = src.slice(0, helperInsertPoint) + helper + src.slice(helperInsertPoint);

const sendJsonInfoAfterHelper = findSendJsonFunction(src);
if (!sendJsonInfoAfterHelper) {
  throw new Error("SENDJSON_FUNCTION_NOT_FOUND_AFTER_HELPER");
}

const injection = "\\n  try { " + sendJsonInfoAfterHelper.payloadArg + " = aiwB6R96R1GEnsureRequesterDeliveryPayload(" + sendJsonInfoAfterHelper.payloadArg + "); } catch (_) {}\\n";
src = src.slice(0, sendJsonInfoAfterHelper.insertAt) + injection + src.slice(sendJsonInfoAfterHelper.insertAt);

fs.writeFileSync(patchedPath, src);
console.log("PATCHED_PATH=" + patchedPath);
console.log("SENDJSON_PAYLOAD_ARG=" + sendJsonInfoAfterHelper.payloadArg);
console.log("PATCHED=B6R96R1G_TEMP_ONLY");
