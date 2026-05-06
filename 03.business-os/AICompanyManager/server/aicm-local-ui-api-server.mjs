import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const SERVER_MARK = "AICM_CLEAN_V2_API_SERVER_ANQ_ANT_V1";
const PORT = Number(process.env.AICM_LOCAL_UI_PORT || process.env.PORT || 8794);
const DB_ENV_KEY = ["PERSONA", "DATABASE", "URL"].join("_");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, "..");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendText(res, statusCode, contentType, text) {
  res.writeHead(statusCode, {
    "content-type": contentType,
    "cache-control": "no-store"
  });
  res.end(text);
}

function safePublicError(error) {
  let raw = "";

  try {
    raw = error && error.stderr ? String(error.stderr) : "";
  } catch (_) {}

  if (!raw) {
    try {
      raw = error && error.stdout ? String(error.stdout) : "";
    } catch (_) {}
  }

  if (!raw) {
    try {
      raw = error && error.message ? String(error.message) : String(error || "unknown error");
    } catch (_) {
      raw = "unknown error";
    }
  }

  const pgProtocol = "post" + "gres(?:ql)?://";
  raw = raw.replace(new RegExp(pgProtocol + "[^\\s'\\\"]+", "g"), "[DB_CONNECTION_REDACTED]");

  if (raw.includes("violates foreign key constraint")) {
    return "DB operation failed: selected company or department is not a v2 record.";
  }

  const errorLine = raw.match(/ERROR:\s*[^\n]+/);
  if (errorLine && errorLine[0]) {
    return "DB operation failed: " + errorLine[0];
  }

  return raw.slice(0, 400);
}

function sqlLiteral(value) {
  return "'" + String(value == null ? "" : value).replace(/'/g, "''") + "'";
}

function requiredUuid(value, name) {
  const text = String(value || "").trim();
  if (!/^[0-9a-fA-F-]{36}$/.test(text)) {
    throw new Error(name + " must be UUID");
  }
  return text;
}

function requiredText(value, name) {
  const text = String(value || "").trim();
  if (!text) {
    throw new Error(name + " is required");
  }
  return text;
}

function runPsqlJson(sql) {
  const connection = process.env[DB_ENV_KEY];

  if (!connection) {
    throw new Error("DB connection env is not set");
  }

  try {
    const out = execFileSync(
      "psql",
      [
        connection,
        "-X",
        "-q",
        "-t",
        "-A",
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        sql
      ],
      {
        encoding: "utf8",
        timeout: 20000,
        maxBuffer: 1024 * 1024 * 12
      }
    );

    const text = String(out || "").trim();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    throw new Error(safePublicError(error));
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (_) {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}



// AICM_PMLW_API_ARJ_ARM_V1
// PMLW API functions use the existing SQL-array + runPsqlJson(sql) pattern.
// No new Pool, no new DB helper, no new connection path.

function aicmPmlwOptionalText(value) {
  return String(value || "").trim();
}

function aicmPmlwTextSql(value) {
  return sqlLiteral(String(value || ""));
}

function aicmPmlwOptionalUuidSql(value) {
  const text = String(value || "").trim();
  return text ? sqlLiteral(text) + "::uuid" : "NULL";
}

function aicmPmlwOptionalDateSql(value) {
  // AICM_AXU_CSV_R5H_DUE_DATE_HELPER_REPAIR_V1
  const text = String(value == null ? "" : value).trim();

  if (!text) {
    return "NULL::date";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error("due_date は YYYY-MM-DD または空欄にしてください: " + text);
  }

  return sqlLiteral(text) + "::date";
}

function aicmPmlwPriority(value) {
  const text = String(value || "normal").trim();
  return ["low", "normal", "high", "urgent"].includes(text) ? text : "normal";
}

function aicmPmlwMajorStatus(value) {
  const text = String(value || "not_started").trim();
  return ["not_started", "assigned_to_leader", "leader_decomposing", "decomposed", "returned", "archived"].includes(text) ? text : "not_started";
}

function aicmPmlwHandoffStatus(value) {
  const text = String(value || "draft").trim();
  return ["draft", "ready_handoff", "handed_off", "accepted", "completed", "archived"].includes(text) ? text : "draft";
}

function aicmPmlwCsvRows(body) {
  const rows = Array.isArray(body.rows) ? body.rows : [];
  return rows.slice(0, 300).map((row) => {
    const majorName = aicmPmlwOptionalText(
      row.major_item_name ||
      row.major_name ||
      row.deliverable_name ||
      row.task_name ||
      row.title
    );

    return {
      department_name: aicmPmlwOptionalText(row.department_name),
      section_name: aicmPmlwOptionalText(row.section_name),
      major_item_name: majorName,
      major_item_description: aicmPmlwOptionalText(row.major_item_description || row.description || row.task_name || row.note),
      assigned_leader_label: aicmPmlwOptionalText(row.assigned_leader_label || row.leader_label || row.responsible_role_code),
      priority_code: aicmPmlwPriority(row.priority_code),
      due_date: aicmPmlwOptionalText(row.due_date),
      note: aicmPmlwOptionalText(row.note)
    };
  }).filter((row) => row.major_item_name.length > 0);
}

function createPresidentPolicy(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const title = requiredText(body.policy_title || body.title, "policy_title");
  const text = requiredText(body.policy_text || body.president_policy_instruction_text || body.description, "policy_text");

  const sql = [
    "WITH inserted AS (",
    "  INSERT INTO business.aicm_president_policy (",
    "    owner_civilization_id, aicm_user_company_id, source_route_code, policy_title, policy_text,",
    "    president_robot_label, requested_by_text, company_common_rules_snapshot,",
    "    policy_status_code, priority_code, due_date,",
    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
    "  ) VALUES (",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    " + sqlLiteral(companyId) + "::uuid,",
    "    " + sqlLiteral(body.source_route_code || "user_to_president") + ",",
    "    " + sqlLiteral(title) + ",",
    "    " + sqlLiteral(text) + ",",
    "    " + aicmPmlwTextSql(body.president_robot_label) + ",",
    "    " + aicmPmlwTextSql(body.requested_by_text || "user") + ",",
    "    " + aicmPmlwTextSql(body.company_common_rules_snapshot) + ",",
    "    " + sqlLiteral(body.policy_status_code || "submitted") + ",",
    "    " + sqlLiteral(aicmPmlwPriority(body.priority_code)) + ",",
    "    " + aicmPmlwOptionalDateSql(body.due_date) + ",",
    "    " + aicmPmlwTextSql(body.reference_files_text) + ",",
    "    " + aicmPmlwTextSql(body.supplemental_materials_text) + ",",
    "    " + aicmPmlwTextSql(body.applicable_rules_text) + ",",
    "    " + aicmPmlwTextSql(body.note) + ",",
    "    " + aicmPmlwTextSql(body.handoff_link),
    "  )",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'president_policy', to_jsonb(inserted)",
    ")::text",
    "FROM inserted;"
  ].join("\n");

  return runPsqlJson(sql);
}

function createManagerMajorItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const majorName = requiredText(body.major_item_name || body.deliverable_name || body.task_name, "major_item_name");

  const sql = [
    "WITH inserted AS (",
    "  INSERT INTO business.aicm_manager_major_work_item (",
    "    owner_civilization_id, aicm_user_company_id, aicm_president_policy_id,",
    "    aicm_user_company_department_id, aicm_user_company_section_id,",
    "    major_item_name, major_item_description, source_route_code,",
    "    manager_robot_label, assigned_leader_label,",
    "    decomposition_status_code, handoff_status_code, priority_code, due_date,",
    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
    "  ) VALUES (",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    " + sqlLiteral(companyId) + "::uuid,",
    "    " + aicmPmlwOptionalUuidSql(body.aicm_president_policy_id) + ",",
    "    " + aicmPmlwOptionalUuidSql(body.aicm_user_company_department_id) + ",",
    "    " + aicmPmlwOptionalUuidSql(body.aicm_user_company_section_id) + ",",
    "    " + sqlLiteral(majorName) + ",",
    "    " + aicmPmlwTextSql(body.major_item_description || body.description || body.note) + ",",
    "    " + sqlLiteral(body.source_route_code || "manual") + ",",
    "    " + aicmPmlwTextSql(body.manager_robot_label) + ",",
    "    " + aicmPmlwTextSql(body.assigned_leader_label) + ",",
    "    " + sqlLiteral(aicmPmlwMajorStatus(body.decomposition_status_code)) + ",",
    "    " + sqlLiteral(aicmPmlwHandoffStatus(body.handoff_status_code)) + ",",
    "    " + sqlLiteral(aicmPmlwPriority(body.priority_code)) + ",",
    "    " + aicmPmlwOptionalDateSql(body.due_date) + ",",
    "    " + aicmPmlwTextSql(body.reference_files_text) + ",",
    "    " + aicmPmlwTextSql(body.supplemental_materials_text) + ",",
    "    " + aicmPmlwTextSql(body.applicable_rules_text) + ",",
    "    " + aicmPmlwTextSql(body.note) + ",",
    "    " + aicmPmlwTextSql(body.handoff_link),
    "  )",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'manager_major_item', to_jsonb(inserted)",
    ")::text",
    "FROM inserted;"
  ].join("\n");

  return runPsqlJson(sql);
}

function updateManagerMajorItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const majorId = requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id");
  const updates = [];

  if (body.major_item_name !== undefined) updates.push("major_item_name = " + sqlLiteral(String(body.major_item_name || "").trim()));
  if (body.major_item_description !== undefined) updates.push("major_item_description = " + aicmPmlwTextSql(body.major_item_description));
  if (body.aicm_president_policy_id !== undefined) updates.push("aicm_president_policy_id = " + aicmPmlwOptionalUuidSql(body.aicm_president_policy_id));
  if (body.aicm_user_company_department_id !== undefined) updates.push("aicm_user_company_department_id = " + aicmPmlwOptionalUuidSql(body.aicm_user_company_department_id));
  if (body.aicm_user_company_section_id !== undefined) updates.push("aicm_user_company_section_id = " + aicmPmlwOptionalUuidSql(body.aicm_user_company_section_id));
  if (body.manager_robot_label !== undefined) updates.push("manager_robot_label = " + aicmPmlwTextSql(body.manager_robot_label));
  if (body.assigned_leader_label !== undefined) updates.push("assigned_leader_label = " + aicmPmlwTextSql(body.assigned_leader_label));
  if (body.decomposition_status_code !== undefined) updates.push("decomposition_status_code = " + sqlLiteral(aicmPmlwMajorStatus(body.decomposition_status_code)));
  if (body.handoff_status_code !== undefined) updates.push("handoff_status_code = " + sqlLiteral(aicmPmlwHandoffStatus(body.handoff_status_code)));
  if (body.priority_code !== undefined) updates.push("priority_code = " + sqlLiteral(aicmPmlwPriority(body.priority_code)));
  if (body.due_date !== undefined) updates.push("due_date = " + aicmPmlwOptionalDateSql(body.due_date));
  if (body.reference_files_text !== undefined) updates.push("reference_files_text = " + aicmPmlwTextSql(body.reference_files_text));
  if (body.supplemental_materials_text !== undefined) updates.push("supplemental_materials_text = " + aicmPmlwTextSql(body.supplemental_materials_text));
  if (body.applicable_rules_text !== undefined) updates.push("applicable_rules_text = " + aicmPmlwTextSql(body.applicable_rules_text));
  if (body.note !== undefined) updates.push("note = " + aicmPmlwTextSql(body.note));
  if (body.handoff_link !== undefined) updates.push("handoff_link = " + aicmPmlwTextSql(body.handoff_link));

  updates.push("updated_at = now()");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_manager_major_work_item",
    "  SET " + updates.join(", "),
    "  WHERE aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'manager_major_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

function archiveManagerMajorItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const majorId = requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id");

  const sql = [
    "WITH archived AS (",
    "  UPDATE business.aicm_manager_major_work_item",
    "  SET decomposition_status_code = 'archived',",
    "      handoff_status_code = 'archived',",
    "      updated_at = now()",
    "  WHERE aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM archived) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'manager_major_item', COALESCE((SELECT to_jsonb(archived) FROM archived), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

function importManagerMajorItemsCsv(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const rows = aicmPmlwCsvRows(body);

  if (rows.length === 0) {
    return { result: "ok", api_identifier: SERVER_MARK, inserted_count: 0, manager_major_items: [] };
  }

  const values = rows.map((row, index) => [
    "(",
    index,
    ", " + sqlLiteral(owner) + "::uuid",
    ", " + sqlLiteral(companyId) + "::uuid",
    ", " + sqlLiteral(row.department_name),
    ", " + sqlLiteral(row.section_name),
    ", " + sqlLiteral(row.major_item_name),
    ", " + sqlLiteral(row.major_item_description),
    ", " + sqlLiteral(row.assigned_leader_label),
    ", " + sqlLiteral(row.priority_code),
    ", " + aicmPmlwOptionalDateSql(row.due_date),
    ", " + sqlLiteral(row.note),
    ")"
  ].join("")).join(",\n    ");

  const sql = [
    "WITH input_rows(row_order, owner_civilization_id, aicm_user_company_id, department_name, section_name, major_item_name, major_item_description, assigned_leader_label, priority_code, due_date, note) AS (",
    "  VALUES",
    "    " + values,
    "), resolved AS (",
    "  SELECT i.*, (",
    "    SELECT d.aicm_user_company_department_id",
    "    FROM business.aicm_user_company_department d",
    "    WHERE d.owner_civilization_id = i.owner_civilization_id",
    "      AND d.aicm_user_company_id = i.aicm_user_company_id",
    "      AND d.department_status = 'active'",
    "      AND (i.department_name = '' OR d.department_name = i.department_name)",
    "    ORDER BY CASE WHEN d.department_name = i.department_name THEN 0 ELSE 1 END, d.display_order, d.created_at",
    "    LIMIT 1",
    "  ) AS department_id",
    "  FROM input_rows i",
    "), resolved_section AS (",
    "  SELECT r.*, (",
    "    SELECT s.aicm_user_company_section_id",
    "    FROM business.aicm_user_company_section s",
    "    WHERE s.owner_civilization_id = r.owner_civilization_id",
    "      AND s.aicm_user_company_id = r.aicm_user_company_id",
    "      AND s.section_status = 'active'",
    "      AND (r.department_id IS NULL OR s.aicm_user_company_department_id = r.department_id)",
    "      AND (r.section_name = '' OR s.section_name = r.section_name)",
    "    ORDER BY CASE WHEN s.section_name = r.section_name THEN 0 ELSE 1 END, s.display_order, s.created_at",
    "    LIMIT 1",
    "  ) AS section_id",
    "  FROM resolved r",
    "), inserted AS (",
    "  INSERT INTO business.aicm_manager_major_work_item (",
    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
    "    major_item_name, major_item_description, source_route_code, assigned_leader_label,",
    "    decomposition_status_code, handoff_status_code, priority_code, due_date, note, display_order",
    "  )",
    "  SELECT owner_civilization_id, aicm_user_company_id, department_id, section_id,",
    "         major_item_name, major_item_description, 'csv_import', assigned_leader_label,",
    "         'not_started', 'draft', priority_code, due_date, note, 100 + row_order",
    "  FROM resolved_section",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'inserted_count', (SELECT count(*) FROM inserted),",
    "  'manager_major_items', COALESCE((SELECT jsonb_agg(to_jsonb(inserted) ORDER BY display_order, created_at) FROM inserted), '[]'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}



// AICM_HUMAN_REVIEW_QUEUE_ARN_ARQ_V1
// Human review queue functions.
// Human review is limited to delivery summaries and exception summaries.
// AI review remains internal; only ai_review_result_text summary is shown.

function aicmHumanReviewOptionalText(value) {
  return String(value || "").trim();
}

function aicmHumanReviewTextSql(value) {
  return sqlLiteral(String(value || ""));
}

function aicmHumanReviewOptionalUuidSql(value) {
  const text = String(value || "").trim();
  return text ? sqlLiteral(text) + "::uuid" : "NULL";
}

function aicmHumanReviewOptionalDateSql(value) {
  const text = String(value || "").trim();
  return /^\\d{4}-\\d{2}-\\d{2}$/.test(text) ? sqlLiteral(text) + "::date" : "NULL";
}

function aicmHumanReviewKind(value) {
  const text = String(value || "delivery_summary").trim();
  return [
    "design_delivery_summary",
    "implementation_delivery_summary",
    "exception_review",
    "final_delivery_summary",
    "delivery_summary"
  ].includes(text) ? text : "delivery_summary";
}

function aicmHumanReviewArtifactKind(value) {
  const text = String(value || "design_doc").trim();
  return ["design_doc", "implementation", "exception", "delivery_package", "handoff"].includes(text) ? text : "design_doc";
}

function aicmHumanReviewPriority(value) {
  const text = String(value || "normal").trim();
  return ["low", "normal", "high", "urgent"].includes(text) ? text : "normal";
}

function createHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const title = requiredText(body.review_title || body.title, "review_title");

  const sql = [
    "WITH inserted AS (",
    "  INSERT INTO business.aicm_human_review_item (",
    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
    "    related_president_policy_id, related_manager_major_work_item_id, related_leader_middle_work_item_id,",
    "    related_deliverable_requirement_id, related_worker_work_unit_id,",
    "    review_kind_code, artifact_kind_code, review_title,",
    "    delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link,",
    "    responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date,",
    "    display_order, metadata_jsonb",
    "  ) VALUES (",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    " + sqlLiteral(companyId) + "::uuid,",
    "    " + aicmHumanReviewOptionalUuidSql(body.aicm_user_company_department_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.aicm_user_company_section_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.related_president_policy_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.related_manager_major_work_item_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.related_leader_middle_work_item_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.related_deliverable_requirement_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.related_worker_work_unit_id) + ",",
    "    " + sqlLiteral(aicmHumanReviewKind(body.review_kind_code)) + ",",
    "    " + sqlLiteral(aicmHumanReviewArtifactKind(body.artifact_kind_code)) + ",",
    "    " + sqlLiteral(title) + ",",
    "    " + aicmHumanReviewTextSql(body.delivery_summary_text) + ",",
    "    " + aicmHumanReviewTextSql(body.main_changes_text) + ",",
    "    " + aicmHumanReviewTextSql(body.ai_review_result_text) + ",",
    "    " + aicmHumanReviewTextSql(body.unresolved_issues_text) + ",",
    "    " + aicmHumanReviewTextSql(body.artifact_link) + ",",
    "    " + aicmHumanReviewTextSql(body.responsible_ai_label) + ",",
    "    " + aicmHumanReviewTextSql(body.requested_by_ai_label) + ",",
    "    'pending',",
    "    " + sqlLiteral(aicmHumanReviewPriority(body.priority_code)) + ",",
    "    " + aicmHumanReviewOptionalDateSql(body.due_date) + ",",
    "    COALESCE(NULLIF(" + sqlLiteral(String(body.display_order || "")) + ", '')::integer, 100),",
    "    '{}'::jsonb",
    "  )",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'human_review_item', to_jsonb(inserted)",
    ")::text",
    "FROM inserted;"
  ].join("\n");

  return runPsqlJson(sql);
}

function approveHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_human_review_item",
    "  SET human_review_status_code = 'approved',",
    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
    "      reviewed_at = now(),",
    "      updated_at = now()",
    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

function returnHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_human_review_item",
    "  SET human_review_status_code = 'returned',",
    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
    "      reviewed_at = now(),",
    "      updated_at = now()",
    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}



// AICM_COMPANY_DEPT_SECTION_UPDATE_ARU_ARX_V1
// Company / Department / Section update functions.
// Uses existing SQL-array + runPsqlJson(sql) pattern only.
// No new Pool, no new DB helper, no new connection path.

function aicmOrgUpdateOptionalText(value) {
  return String(value || "").trim();
}

function aicmOrgUpdateTextSql(value) {
  return sqlLiteral(String(value || ""));
}

function aicmOrgUpdateStatus(value, allowed, fallback) {
  const text = String(value || fallback).trim();
  return allowed.includes(text) ? text : fallback;
}

function updateCompany(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const name = requiredText(body.company_name || body.companyName, "company_name");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_user_company",
    "  SET company_name = " + sqlLiteral(name) + ",",
    "      business_domain = " + aicmOrgUpdateTextSql(body.business_domain || body.businessDomain) + ",",
    "      company_common_rules_text = " + aicmOrgUpdateTextSql(body.company_common_rules_text || body.companyCommonRulesText) + ",",
    "      president_policy_instruction_text = " + aicmOrgUpdateTextSql(body.president_policy_instruction_text || body.presidentPolicyInstructionText) + ",",
    "      updated_at = now()",
    "  WHERE aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'company', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

function updateDepartment(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
  const name = requiredText(body.department_name || body.departmentName, "department_name");
  const status = aicmOrgUpdateStatus(body.department_status || body.department_status_code, ["active", "inactive", "archived"], "active");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_user_company_department",
    "  SET department_name = " + sqlLiteral(name) + ",",
    "      purpose = " + aicmOrgUpdateTextSql(body.purpose) + ",",
    "      department_status = " + sqlLiteral(status) + ",",
    "      updated_at = now()",
    "  WHERE aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'department', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

function updateSection(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const sectionId = requiredUuid(body.aicm_user_company_section_id, "aicm_user_company_section_id");
  const name = requiredText(body.section_name || body.sectionName, "section_name");
  const status = aicmOrgUpdateStatus(body.section_status || body.section_status_code, ["active", "inactive", "archived"], "active");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_user_company_section",
    "  SET section_name = " + sqlLiteral(name) + ",",
    "      purpose = " + aicmOrgUpdateTextSql(body.purpose) + ",",
    "      section_status = " + sqlLiteral(status) + ",",
    "      updated_at = now()",
    "  WHERE aicm_user_company_section_id = " + sqlLiteral(sectionId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'section', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}


function getContext(ownerCivilizationId) {
  const owner = requiredUuid(ownerCivilizationId, "owner_civilization_id");

  const sql = [
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'owner_civilization_id', " + sqlLiteral(owner) + ",",
    "  'companies', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC), '[]'::jsonb)",
    "    FROM business.aicm_user_company c",
    "    WHERE c.owner_civilization_id::text = " + sqlLiteral(owner),
    "      AND c.company_status = 'active'",
    "  ),",
    "  'departments', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(d) ORDER BY d.display_order, d.created_at), '[]'::jsonb)",
    "    FROM business.aicm_user_company_department d",
    "    WHERE d.owner_civilization_id::text = " + sqlLiteral(owner),
    "      AND d.department_status = 'active'",
    "  ),",
    "  'sections', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.display_order, s.created_at), '[]'::jsonb)",
    "    FROM business.aicm_user_company_section s",
    "    WHERE s.owner_civilization_id::text = " + sqlLiteral(owner),
    "      AND s.section_status = 'active'",
    "  ),",
    "  'placements', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC), '[]'::jsonb)",
    "    FROM business.vw_aicm_user_company_worker_placement_display p",
    "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
    "      AND p.status_code = 'active'",
    "  ),",
    "  'task_ledger', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.display_order, t.created_at DESC), '[]'::jsonb)",
    "    FROM business.vw_aicm_user_company_department_task_ledger_display t",
    "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
    "      AND t.task_status_code <> 'archived'",
    "  ),",
    // AICM_PMLW_GETCONTEXT_SQL_EXTENSION_AQP_AQS_V1
    "  'pmlw_president_policies', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.display_order ASC, p.updated_at DESC, p.created_at DESC), '[]'::jsonb)",
    "    FROM business.vw_aicm_pmlw_president_policy_display p",
    "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
    "  ),",
    "  'pmlw_major_items', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.display_order ASC, m.updated_at DESC, m.created_at DESC), '[]'::jsonb)",
    "    FROM business.vw_aicm_pmlw_major_work_display m",
    "    WHERE m.owner_civilization_id::text = " + sqlLiteral(owner),
    "  ),",
    "  'pmlw_middle_items', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(l) ORDER BY l.display_order ASC, l.updated_at DESC, l.created_at DESC), '[]'::jsonb)",
    "    FROM business.vw_aicm_pmlw_leader_middle_display l",
    "    WHERE l.owner_civilization_id::text = " + sqlLiteral(owner),
    "  ),",
    "  'pmlw_deliverable_requirements', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.display_order ASC, r.updated_at DESC, r.created_at DESC), '[]'::jsonb)",
    "    FROM business.vw_aicm_pmlw_deliverable_requirement_display r",
    "    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),
    "  ),",
    "  'pmlw_worker_work_units', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(w) ORDER BY w.display_order ASC, w.updated_at DESC, w.created_at DESC), '[]'::jsonb)",
    "    FROM business.vw_aicm_pmlw_worker_work_unit_display w",
    "    WHERE w.owner_civilization_id::text = " + sqlLiteral(owner),
    "  ),",
    "  'pmlw_workflow_tree', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.last_updated_at DESC NULLS LAST), '[]'::jsonb)",
    "    FROM business.vw_aicm_pmlw_workflow_tree t",
    "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
    "  ),",
    // AICM_HUMAN_REVIEW_QUEUE_ARN_ARQ_V1_CONTEXT
    "  'review_wait_items', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.priority_code DESC, r.requested_at DESC, r.created_at DESC), '[]'::jsonb)",
    "    FROM business.vw_aicm_human_review_wait_display r",
    "    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),
    "  ),",
    "  'robot_catalog', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.aiworker_model_code), '[]'::jsonb)",
    "    FROM business.vw_ai_company_manager_system_robot_selector_options r",
    "  )",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

function createCompany(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const name = requiredText(body.company_name, "company_name");
  const domain = String(body.business_domain || "");

  const sql = [
    "WITH inserted AS (",
    "  INSERT INTO business.aicm_user_company (",
    "    owner_civilization_id, company_name, business_domain, company_status, selected_flag",
    "  ) VALUES (",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    " + sqlLiteral(name) + ",",
    "    " + sqlLiteral(domain) + ",",
    "    'active',",
    "    true",
    "  )",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'company', to_jsonb(inserted)",
    ")::text",
    "FROM inserted;"
  ].join("\n");

  return runPsqlJson(sql);
}

function createDepartment(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const name = requiredText(body.department_name, "department_name");
  const purpose = String(body.purpose || "");

  const sql = [
    "WITH company_ok AS (",
    "  SELECT aicm_user_company_id",
    "  FROM business.aicm_user_company",
    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND company_status = 'active'",
    "  LIMIT 1",
    "), inserted AS (",
    "  INSERT INTO business.aicm_user_company_department (",
    "    owner_civilization_id, aicm_user_company_id, department_name, purpose, department_status",
    "  )",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    aicm_user_company_id,",
    "    " + sqlLiteral(name) + ",",
    "    " + sqlLiteral(purpose) + ",",
    "    'active'",
    "  FROM company_ok",
    "  RETURNING *",
    ")",
    "SELECT CASE",
    "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
    "    (SELECT jsonb_build_object(",
    "      'result', 'ok',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'department', to_jsonb(inserted)",
    "    ) FROM inserted)::text",
    "  ELSE",
    "    jsonb_build_object(",
    "      'result', 'error',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'error_message', '先にv2のAI企業を作成・選択してください。旧ローカル会社IDでは部門保存できません。'",
    "    )::text",
    "END;"
  ].join("\n");

  return runPsqlJson(sql);
}

function createSection(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
  const name = requiredText(body.section_name, "section_name");
  const purpose = String(body.purpose || "");

  const sql = [
    "WITH department_ok AS (",
    "  SELECT aicm_user_company_id, aicm_user_company_department_id",
    "  FROM business.aicm_user_company_department",
    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
    "    AND department_status = 'active'",
    "  LIMIT 1",
    "), inserted AS (",
    "  INSERT INTO business.aicm_user_company_section (",
    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, section_name, purpose, section_status",
    "  )",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    aicm_user_company_id,",
    "    aicm_user_company_department_id,",
    "    " + sqlLiteral(name) + ",",
    "    " + sqlLiteral(purpose) + ",",
    "    'active'",
    "  FROM department_ok",
    "  RETURNING *",
    ")",
    "SELECT CASE",
    "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
    "    (SELECT jsonb_build_object(",
    "      'result', 'ok',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'section', to_jsonb(inserted)",
    "    ) FROM inserted)::text",
    "  ELSE",
    "    jsonb_build_object(",
    "      'result', 'error',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'error_message', '先にv2のAI企業と部門を作成・選択してください。旧ローカルIDでは課保存できません。'",
    "    )::text",
    "END;"
  ].join("\n");

  return runPsqlJson(sql);
}


function createTaskLedger(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
  const sectionId = String(body.aicm_user_company_section_id || "").trim();

  const deliverableName = requiredText(body.deliverable_name, "deliverable_name");
  const taskName = requiredText(body.task_name, "task_name");
  const workTypeCode = String(body.work_type_code || "design").trim() || "design";
  const responsibleRoleCode = String(body.responsible_role_code || "Manager").trim() || "Manager";
  const responsibleRobotLabel = String(body.responsible_robot_label || "");
  const taskStatusCode = String(body.task_status_code || "todo").trim() || "todo";
  const priorityCode = String(body.priority_code || "normal").trim() || "normal";
  const dueDate = String(body.due_date || "").trim();

  const sectionSql = sectionId ? sqlLiteral(sectionId) + "::uuid" : "NULL";
  const dueDateSql = dueDate ? sqlLiteral(dueDate) + "::date" : "NULL";

  const sql = [
    "WITH department_ok AS (",
    "  SELECT d.aicm_user_company_id, d.aicm_user_company_department_id",
    "  FROM business.aicm_user_company_department d",
    "  JOIN business.aicm_user_company c",
    "    ON c.aicm_user_company_id = d.aicm_user_company_id",
    "  WHERE d.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND d.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND d.aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
    "    AND d.department_status = 'active'",
    "    AND c.company_status = 'active'",
    "  LIMIT 1",
    "), inserted AS (",
    "  INSERT INTO business.aicm_user_company_department_task_ledger (",
    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
    "    deliverable_name, task_name, work_type_code, responsible_role_code, responsible_robot_label,",
    "    task_status_code, priority_code, due_date,",
    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
    "  )",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    aicm_user_company_id,",
    "    aicm_user_company_department_id,",
    "    " + sectionSql + ",",
    "    " + sqlLiteral(deliverableName) + ",",
    "    " + sqlLiteral(taskName) + ",",
    "    " + sqlLiteral(workTypeCode) + ",",
    "    " + sqlLiteral(responsibleRoleCode) + ",",
    "    " + sqlLiteral(responsibleRobotLabel) + ",",
    "    " + sqlLiteral(taskStatusCode) + ",",
    "    " + sqlLiteral(priorityCode) + ",",
    "    " + dueDateSql + ",",
    "    " + sqlLiteral(body.reference_files_text || "") + ",",
    "    " + sqlLiteral(body.supplemental_materials_text || "") + ",",
    "    " + sqlLiteral(body.applicable_rules_text || "") + ",",
    "    " + sqlLiteral(body.note || "") + ",",
    "    " + sqlLiteral(body.handoff_link || "") + "",
    "  FROM department_ok",
    "  RETURNING *",
    ")",
    "SELECT CASE",
    "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
    "    (SELECT jsonb_build_object(",
    "      'result', 'ok',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'task_ledger', to_jsonb(inserted)",
    "    ) FROM inserted)::text",
    "  ELSE",
    "    jsonb_build_object(",
    "      'result', 'error',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'error_message', '先にv2のAI企業と部門を作成・選択してください。'",
    "    )::text",
    "END;"
  ].join("\n");

  return runPsqlJson(sql);
}


function createPlacement(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const roleCode = requiredText(body.role_code, "role_code");
  const modelCode = requiredText(body.aiworker_model_code, "aiworker_model_code");

  const departmentId = String(body.aicm_user_company_department_id || "").trim();
  const sectionId = String(body.aicm_user_company_section_id || "").trim();
  const targetLevelCode = requiredText(body.target_level_code || "company", "target_level_code");
  const targetId = String(body.target_id || "").trim();
  const robotPoolId = String(body.robot_pool_id || "").trim();
  const nickname = String(body.internal_nickname || "");

  const departmentSql = departmentId ? sqlLiteral(departmentId) + "::uuid" : "NULL";
  const sectionSql = sectionId ? sqlLiteral(sectionId) + "::uuid" : "NULL";
  const targetSql = targetId ? sqlLiteral(targetId) + "::uuid" : "NULL";
  const robotPoolSql = robotPoolId ? sqlLiteral(robotPoolId) + "::uuid" : "NULL";

  const sql = [
    "WITH company_ok AS (",
    "  SELECT aicm_user_company_id",
    "  FROM business.aicm_user_company",
    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND company_status = 'active'",
    "  LIMIT 1",
    "), inserted AS (",
    "  INSERT INTO business.aicm_user_company_worker_placement (",
    "    owner_civilization_id, aicm_user_company_id,",
    "    aicm_user_company_department_id, aicm_user_company_section_id,",
    "    target_level_code, target_id, app_code, role_code, robot_pool_id,",
    "    aiworker_model_code, internal_nickname, placement_quantity, placement_mode_code, status_code",
    "  )",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    aicm_user_company_id,",
    "    " + departmentSql + ",",
    "    " + sectionSql + ",",
    "    " + sqlLiteral(targetLevelCode) + ",",
    "    " + targetSql + ",",
    "    'AICompanyManager',",
    "    " + sqlLiteral(roleCode) + ",",
    "    " + robotPoolSql + ",",
    "    " + sqlLiteral(modelCode) + ",",
    "    " + sqlLiteral(nickname) + ",",
    "    1,",
    "    'unlimited_system_use',",
    "    'active'",
    "  FROM company_ok",
    "  RETURNING *",
    ")",
    "SELECT CASE",
    "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
    "    (SELECT jsonb_build_object(",
    "      'result', 'ok',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'placement', to_jsonb(inserted)",
    "    ) FROM inserted)::text",
    "  ELSE",
    "    jsonb_build_object(",
    "      'result', 'error',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'error_message', '先にv2のAI企業を作成・選択してください。'",
    "    )::text",
    "END;"
  ].join("\n");

  return runPsqlJson(sql);
}



// AICM_ROLE_SETTINGS_SYNC_AXC_V1
// Synchronize President / Manager / Leader / Worker role settings.
// Canonical table: business.aicm_user_company_worker_placement.
// This endpoint archives current active placements for each submitted target+role,
// then recreates submitted active rows. This prevents duplicate single-slot assignments.
function aicmRoleSyncOptionalUuidSql(value) {
  const text = String(value || "").trim();
  return /^[0-9a-fA-F-]{36}$/.test(text) ? sqlLiteral(text) + "::uuid" : "NULL";
}

function aicmRoleSyncRole(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text === "president") return "President";
  if (text === "manager") return "Manager";
  if (text === "leader") return "Leader";
  if (text === "worker" || text === "employee") return "Worker";
  throw new Error("invalid role_code");
}

function aicmRoleSyncTargetLevel(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text === "company") return "company";
  if (text === "department") return "department";
  if (text === "section" || text === "organization") return "section";
  throw new Error("invalid target_level_code");
}

function aicmRoleSyncRows(body) {
  const rows = Array.isArray(body.role_placements) ? body.role_placements : [];
  return rows.slice(0, 30).map((row, index) => {
    const roleCode = aicmRoleSyncRole(row.role_code || row.roleCode);
    const targetLevelCode = aicmRoleSyncTargetLevel(row.target_level_code || row.targetLevelCode);
    return {
      row_order: index,
      role_code: roleCode,
      target_level_code: targetLevelCode,
      aicm_user_company_department_id: String(row.aicm_user_company_department_id || row.departmentId || "").trim(),
      aicm_user_company_section_id: String(row.aicm_user_company_section_id || row.sectionId || row.organizationId || "").trim(),
      target_id: String(row.target_id || row.targetId || "").trim(),
      robot_pool_id: String(row.robot_pool_id || row.robotPoolId || "").trim(),
      aiworker_model_code: String(row.aiworker_model_code || row.aiworkerModelCode || "").trim(),
      internal_nickname: String(row.internal_nickname || row.internalNickname || "").trim()
    };
  });
}

function syncRoleSettings(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const submittedRows = aicmRoleSyncRows(body);

  const targetKeys = [];
  const insertRows = [];

  for (const row of submittedRows) {
    const targetId = row.target_id ||
      (row.target_level_code === "company" ? companyId : "") ||
      (row.target_level_code === "department" ? row.aicm_user_company_department_id : "") ||
      (row.target_level_code === "section" ? row.aicm_user_company_section_id : "");

    if (!targetId) continue;

    const key = [row.target_level_code, targetId, row.role_code].join("|");

    if (!targetKeys.some((item) => item.key === key)) {
      targetKeys.push({
        key,
        target_level_code: row.target_level_code,
        target_id: targetId,
        role_code: row.role_code,
        aicm_user_company_department_id: row.aicm_user_company_department_id,
        aicm_user_company_section_id: row.aicm_user_company_section_id
      });
    }

    if (!row.robot_pool_id && !row.aiworker_model_code) continue;

    insertRows.push({
      ...row,
      target_id: targetId,
      aiworker_model_code: row.aiworker_model_code || "unknown"
    });
  }

  if (targetKeys.length === 0) {
    return {
      result: "ok",
      api_identifier: SERVER_MARK,
      archived_count: 0,
      inserted_count: 0,
      placements: [],
      note: "no role placement targets"
    };
  }

  const targetValues = targetKeys.map((row, index) => [
    "(",
    String(index),
    ", " + sqlLiteral(row.target_level_code),
    ", " + sqlLiteral(row.target_id) + "::uuid",
    ", " + sqlLiteral(row.role_code),
    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_department_id),
    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_section_id),
    ")"
  ].join("")).join(",\n    ");

  const insertValues = insertRows.length ? insertRows.map((row, index) => [
    "(",
    String(index),
    ", " + sqlLiteral(row.target_level_code),
    ", " + sqlLiteral(row.target_id) + "::uuid",
    ", " + sqlLiteral(row.role_code),
    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_department_id),
    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_section_id),
    ", " + aicmRoleSyncOptionalUuidSql(row.robot_pool_id),
    ", " + sqlLiteral(row.aiworker_model_code),
    ", " + sqlLiteral(row.internal_nickname),
    ")"
  ].join("")).join(",\n    ") : "";

  const insertCte = insertRows.length ? [
    "), insert_rows(row_order, target_level_code, target_id, role_code, aicm_user_company_department_id, aicm_user_company_section_id, robot_pool_id, aiworker_model_code, internal_nickname) AS (",
    "  VALUES",
    "    " + insertValues,
    "), inserted AS (",
    "  INSERT INTO business.aicm_user_company_worker_placement (",
    "    owner_civilization_id, aicm_user_company_id,",
    "    aicm_user_company_department_id, aicm_user_company_section_id,",
    "    target_level_code, target_id, app_code, role_code, robot_pool_id,",
    "    aiworker_model_code, internal_nickname, placement_quantity, placement_mode_code, status_code",
    "  )",
    "  SELECT",
    "  -- AICM_ROLE_SYNC_UUID_CAST_AXM_V1",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    c.aicm_user_company_id,",
    "    i.aicm_user_company_department_id::uuid,",
    "    i.aicm_user_company_section_id::uuid,",
    "    i.target_level_code,",
    "    i.target_id,",
    "    'AICompanyManager',",
    "    i.role_code,",
    "    i.robot_pool_id::uuid,",
    "    i.aiworker_model_code,",
    "    i.internal_nickname,",
    "    1,",
    "    'unlimited_system_use',",
    "    'active'",
    "  FROM insert_rows i",
    "  CROSS JOIN company_ok c",
    "  RETURNING *"
  ].join("\n") : [
    "), inserted AS (",
    "  SELECT *",
    "  FROM business.aicm_user_company_worker_placement",
    "  WHERE false"
  ].join("\n");

  const sql = [
    "WITH company_ok AS (",
    "  SELECT aicm_user_company_id",
    "  FROM business.aicm_user_company",
    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND company_status = 'active'",
    "  LIMIT 1",
    "), target_keys(row_order, target_level_code, target_id, role_code, aicm_user_company_department_id, aicm_user_company_section_id) AS (",
    "  VALUES",
    "    " + targetValues,
    "), archived AS (",
    "  UPDATE business.aicm_user_company_worker_placement p",
    "  SET status_code = 'archived',",
    "      updated_at = now(),",
    "      metadata_jsonb = COALESCE(p.metadata_jsonb, '{}'::jsonb) || jsonb_build_object('archived_by', 'AICompanyManager.role_settings_sync', 'archived_at', now()::text)",
    "  FROM target_keys k",
    "  WHERE p.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND p.app_code = 'AICompanyManager'",
    "    AND p.status_code = 'active'",
    "    AND lower(p.target_level_code) = lower(k.target_level_code)",
    "    AND p.target_id = k.target_id",
    "    AND lower(p.role_code) = lower(k.role_code)",
    "  RETURNING p.*",
    insertCte,
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM company_ok) THEN 'ok' ELSE 'error' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'archived_count', (SELECT count(*) FROM archived),",
    "  'inserted_count', (SELECT count(*) FROM inserted),",
    "  'placements', COALESCE((SELECT jsonb_agg(to_jsonb(inserted) ORDER BY created_at, aicm_user_company_worker_placement_id) FROM inserted), '[]'::jsonb),",
    "  'error_message', CASE WHEN EXISTS (SELECT 1 FROM company_ok) THEN '' ELSE '先にv2のAI企業を作成・選択してください。' END",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}



// AICM_WORKBENCH_RUNTIME_CODE_NORMALIZE_AXT_R7_V1
// Normalize AICompanyManager Workbench request values to AIWorkerOS runtime profile canon.
// DB access here is read-only and uses the existing runPsqlJson/sqlLiteral pattern.
function aicmNormalizeWorkbenchRuntimeAppSurfaceCode(value) {
  const text = String(value || "").trim();

  if (!text || text === "ai_company_manager_worker_execution" || text === "AICompanyManager") {
    return "ai_company_manager";
  }

  return text;
}

function aicmNormalizeWorkbenchRuntimeModelCode(value) {
  const text = String(value || "").trim();

  if (!text) {
    return text;
  }

  const sql = [
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'input_model_code', " + sqlLiteral(text) + ",",
    "  'model_code', COALESCE((",
    "    SELECT c.model_code",
    "    FROM aiworker.vw_app_aiworker_robot_selection_card_v1 c",
    "    WHERE lower(c.model_code) = lower(" + sqlLiteral(text) + ")",
    "       OR lower(c.model_no) = lower(" + sqlLiteral(text) + ")",
    "       OR lower(replace(c.model_no, '-', '_')) = lower(replace(" + sqlLiteral(text) + ", '-', '_'))",
    "       OR lower(replace(c.model_code, '_', '-')) = lower(replace(" + sqlLiteral(text) + ", '_', '-'))",
    "    ORDER BY CASE",
    "      WHEN lower(c.model_code) = lower(" + sqlLiteral(text) + ") THEN 0",
    "      WHEN lower(c.model_no) = lower(" + sqlLiteral(text) + ") THEN 1",
    "      ELSE 2",
    "    END, c.sort_order",
    "    LIMIT 1",
    "  ), " + sqlLiteral(text) + ")",
    ")::text;"
  ].join("\n");

  try {
    const result = runPsqlJson(sql);
    return result && result.model_code ? String(result.model_code) : text;
  } catch (error) {
    return text;
  }
}

function aicmNormalizeWorkbenchRuntimeRequestBody(body) {
  const input = body && typeof body === "object" ? body : {};
  const next = { ...input };

  const rawModelCode = (
    next.model_code ||
    next.aiworker_model_code ||
    next.model_no ||
    next.worker_model_code ||
    ""
  );

  next.app_surface_code = aicmNormalizeWorkbenchRuntimeAppSurfaceCode(next.app_surface_code);
  next.model_code = aicmNormalizeWorkbenchRuntimeModelCode(rawModelCode);

  return next;
}

// AICM_WORKER_RUNTIME_REQUEST_AXS_V1
// Server-side bridge from AICompanyManager to AIWorkerOS Runtime Execution.
// UI must never receive PERSONA_AIWORKEROS_AUTH_TOKEN.
// This function does local placement validation, then forwards a sanitized request to AIWorkerOS.
function aicmWorkerRuntimeText(value) {
  return String(value || "").trim();
}

function aicmWorkerRuntimeDefault(value, fallback) {
  const text = aicmWorkerRuntimeText(value);
  return text || fallback;
}

function aicmWorkerRuntimeOptionalUuidSql(value) {
  const text = aicmWorkerRuntimeText(value);
  return /^[0-9a-fA-F-]{36}$/.test(text) ? sqlLiteral(text) + "::uuid" : "NULL";
}

function aicmWorkerRuntimeBaseUrl() {
  const base = aicmWorkerRuntimeText(process.env.PERSONA_AIWORKEROS_BASE_URL);
  if (!base) {
    throw new Error("PERSONA_AIWORKEROS_BASE_URL is not set");
  }
  return base.replace(/\/+$/, "");
}

function aicmWorkerRuntimeAuthToken() {
  const token = aicmWorkerRuntimeText(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN);
  if (!token) {
    throw new Error("PERSONA_AIWORKEROS_AUTH_TOKEN is not set");
  }
  return token;
}

function getAicmWorkerRuntimePlacement(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const placementId = requiredUuid(body.aicm_user_company_worker_placement_id, "aicm_user_company_worker_placement_id");

  const sql = [
    "WITH placement AS (",
    "  SELECT",
    "    p.aicm_user_company_worker_placement_id,",
    "    p.owner_civilization_id,",
    "    p.aicm_user_company_id,",
    "    p.aicm_user_company_department_id,",
    "    p.aicm_user_company_section_id,",
    "    p.target_level_code,",
    "    p.target_id,",
    "    p.app_code,",
    "    p.role_code,",
    "    p.robot_pool_id,",
    "    p.aiworker_model_code,",
    "    p.internal_nickname,",
    "    p.status_code,",
    "    COALESCE(v.display_label, NULLIF(p.internal_nickname, '') || '@' || p.role_code, p.aiworker_model_code || '@' || p.role_code) AS display_label",
    "  FROM business.aicm_user_company_worker_placement p",
    "  LEFT JOIN business.vw_aicm_user_company_worker_placement_display v",
    "    ON v.aicm_user_company_worker_placement_id = p.aicm_user_company_worker_placement_id",
    "  WHERE p.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND p.aicm_user_company_worker_placement_id = " + sqlLiteral(placementId) + "::uuid",
    "    AND p.app_code = 'AICompanyManager'",
    "    AND p.status_code = 'active'",
    "    AND lower(p.role_code) = lower('Worker')",
    "  LIMIT 1",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM placement) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'placement', COALESCE((SELECT to_jsonb(placement) FROM placement), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

function aicmWorkerRuntimeBuildIdempotencyKey(body, placement) {
  const provided = aicmWorkerRuntimeText(body.idempotency_key);
  if (provided) return provided;

  const sourceRequestRef = aicmWorkerRuntimeDefault(body.source_request_ref, "manual:" + Date.now());
  const placementId = aicmWorkerRuntimeText(placement.aicm_user_company_worker_placement_id);
  return "aicm:" + sourceRequestRef + ":" + placementId;
}

function createIndividualRuntimeHumanReviewItemB6R44S(requestBody, runtimePayload) {
  requestBody = requestBody && typeof requestBody === "object" ? requestBody : {};
  runtimePayload = runtimePayload && typeof runtimePayload === "object" ? runtimePayload : {};

  const runtimeRequest = runtimePayload.runtime_request && typeof runtimePayload.runtime_request === "object"
    ? runtimePayload.runtime_request
    : {};

  const requestId = String(
    runtimeRequest.request_id ||
    runtimePayload.request_id ||
    ""
  ).trim();

  const sourceRouteCode = String(
    requestBody.source_route_code ||
    requestBody.sourceRouteCode ||
    runtimeRequest.source_route_code ||
    runtimePayload.source_route_code ||
    ""
  ).trim();

  if (sourceRouteCode !== "individual_instruction") {
    return {
      result: "skipped",
      reason: "NOT_INDIVIDUAL_INSTRUCTION_ROUTE"
    };
  }

  if (!requestId) {
    return {
      result: "skipped",
      reason: "REQUEST_ID_NOT_FOUND"
    };
  }

  const owner = requiredUuid(requestBody.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(requestBody.aicm_user_company_id, "aicm_user_company_id");

  const workerLabel = String(
    (runtimePayload.worker_placement && runtimePayload.worker_placement.display_label) ||
    requestBody.worker_label ||
    requestBody.responsible_ai_label ||
    "AIWorker"
  ).trim() || "AIWorker";

  const title = String(
    requestBody.task_title ||
    runtimeRequest.task_title ||
    "個別依頼 実行結果レビュー"
  ).trim() || "個別依頼 実行結果レビュー";

  const summary = String(
    "個別依頼のAIWorkerOS実行受付が完了しました。Workbenchで実行状態を確認し、必要に応じてレビュー・差し戻しを行ってください。 runtime_request_id=" + requestId
  );

  const metadataJson = JSON.stringify({
    source: "worker-runtime/request",
    source_app_ref: "AICompanyManager",
    source_route_code: "individual_instruction",
    source_screen_code: "ai_execution_workbench",
    source_entity_type: "runtime_request",
    source_entity_id: requestId,
    runtime_request_id: requestId,
    source_request_ref: runtimeRequest.source_request_ref || requestBody.source_request_ref || "",
    return_target_type: "workbench_runtime_request",
    return_target_id: requestId,
    reexecute_target_type: "runtime_request",
    reexecute_target_id: requestId,
    context_restore_type: "workbench",
    context_restore_id: requestId
  });

  const sql = [
    "WITH existing AS (",
    "  SELECT *",
    "  FROM business.aicm_human_review_item h",
    "  WHERE h.metadata_jsonb->>'runtime_request_id' = " + sqlLiteral(requestId),
    "    AND COALESCE(h.human_review_status_code, '') <> " + sqlLiteral("archived"),
    "  LIMIT 1",
    "), inserted AS (",
    "  INSERT INTO business.aicm_human_review_item (",
    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
    "    related_president_policy_id, related_manager_major_work_item_id, related_leader_middle_work_item_id,",
    "    related_deliverable_requirement_id, related_worker_work_unit_id,",
    "    review_kind_code, artifact_kind_code, review_title,",
    "    delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link,",
    "    responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date,",
    "    display_order, metadata_jsonb",
    "  )",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    " + sqlLiteral(companyId) + "::uuid,",
    "    " + aicmHumanReviewOptionalUuidSql(requestBody.aicm_user_company_department_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(requestBody.aicm_user_company_section_id) + ",",
    "    NULL::uuid,",
    "    NULL::uuid,",
    "    NULL::uuid,",
    "    NULL::uuid,",
    "    NULL::uuid,",
    "    " + sqlLiteral("delivery_summary") + ",",
    "    " + sqlLiteral("delivery_package") + ",",
    "    " + sqlLiteral("個別依頼レビュー: ") + " || " + sqlLiteral(title) + ",",
    "    " + sqlLiteral(summary) + ",",
    "    " + sqlLiteral("AIWorkerOS runtime request accepted.") + ",",
    "    " + sqlLiteral("自動レビュー待ち登録: human_go済みの個別依頼として受付。") + ",",
    "    " + sqlLiteral("") + ",",
    "    " + sqlLiteral("") + ",",
    "    " + sqlLiteral(workerLabel) + ",",
    "    " + sqlLiteral("AICompanyManager") + ",",
    "    " + sqlLiteral("pending") + ",",
    "    " + sqlLiteral(aicmHumanReviewPriority(requestBody.priority_code)) + ",",
    "    " + aicmHumanReviewOptionalDateSql(requestBody.due_date) + ",",
    "    COALESCE(NULLIF(" + sqlLiteral(String(requestBody.display_order || "")) + ", '')::integer, 100),",
    "    " + sqlLiteral(metadataJson) + "::jsonb",
    "  WHERE NOT EXISTS (SELECT 1 FROM existing)",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'created_human_review_count', (SELECT count(*) FROM inserted),",
    "  'existing_human_review_count', (SELECT count(*) FROM existing),",
    "  'human_review_item', COALESCE((SELECT to_jsonb(inserted) FROM inserted LIMIT 1), (SELECT to_jsonb(existing) FROM existing LIMIT 1), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

async function createWorkerRuntimeRequest(body) {
  // AICM_WORKBENCH_RUNTIME_CODE_NORMALIZE_AXT_R7_V1
  body = aicmNormalizeWorkbenchRuntimeRequestBody(body);

  body = body || {};

  const placementResult = getAicmWorkerRuntimePlacement(body);
  if (!placementResult || placementResult.result !== "ok" || !placementResult.placement) {
    return {
      result: "error",
      api_identifier: SERVER_MARK,
      error_message: "有効なWorker配置が見つかりません。"
    };
  }

  const placement = placementResult.placement;
  const baseUrl = aicmWorkerRuntimeBaseUrl();
  const token = aicmWorkerRuntimeAuthToken();

  const modelCode = aicmWorkerRuntimeDefault(
    body.model_code || body.aiworker_model_code,
    placement.aiworker_model_code
  );

  const appSurfaceCode = aicmWorkerRuntimeDefault(
    body.app_surface_code,
    "ai_company_manager_worker_execution"
  );

  const taskDomainCode = aicmWorkerRuntimeDefault(
    body.task_domain_code,
    "business_operation"
  );

  const taskTitle = requiredText(body.task_title || body.title, "task_title");
  const taskInstruction = requiredText(body.task_instruction_ja || body.task_instruction || body.instruction, "task_instruction_ja");

  const sourceAppRef = aicmWorkerRuntimeDefault(body.source_app_ref, "AICompanyManager");
  const sourceRequestRef = aicmWorkerRuntimeDefault(body.source_request_ref, "manual:" + Date.now());
  const requestedByRef = aicmWorkerRuntimeDefault(body.requested_by_ref, "human");
  const idempotencyKey = aicmWorkerRuntimeBuildIdempotencyKey(body, placement);

  const sourceRouteCode = aicmWorkerRuntimeDefault(
    body.source_route_code || body.sourceRouteCode || body.source_route,
    ""
  );

  const outboundBody = {
    app_surface_code: appSurfaceCode,
    model_code: modelCode,
    task_domain_code: taskDomainCode,
    task_title: taskTitle,
    task_instruction_ja: taskInstruction,
    source_app_ref: sourceAppRef,
    source_request_ref: sourceRequestRef,
    requested_by_ref: requestedByRef,
    idempotency_key: idempotencyKey
  };

  if (sourceRouteCode) {
    outboundBody.source_route_code = sourceRouteCode;
  }

  const url = baseUrl + "/aiworker/v1/runtime-execution/request";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify(outboundBody)
  });

  const responseText = await response.text();
  let responseJson = null;

  try {
    responseJson = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    responseJson = {
      raw_response_text: responseText
    };
  }

  if (!response.ok) {
    return {
      result: "error",
      api_identifier: SERVER_MARK,
      http_status_code: response.status,
      error_message: responseJson.error_message || responseJson.message || responseJson.error || "AIWorkerOS runtime request failed",
      aiworker_response: responseJson
    };
  }

  const requestId =
    responseJson.request_id ||
    (responseJson.runtime_request && responseJson.runtime_request.request_id) ||
    (responseJson.request && responseJson.request.request_id) ||
    "";

  const requestStatusCode =
    responseJson.request_status_code ||
    (responseJson.runtime_request && responseJson.runtime_request.request_status_code) ||
    (responseJson.request && responseJson.request.request_status_code) ||
    "";

  return {
    result: "ok",
    api_identifier: SERVER_MARK,
    worker_placement: {
      aicm_user_company_worker_placement_id: placement.aicm_user_company_worker_placement_id,
      display_label: placement.display_label,
      aiworker_model_code: placement.aiworker_model_code,
      role_code: placement.role_code
    },
    runtime_request: {
      request_id: requestId,
      request_status_code: requestStatusCode,
      app_surface_code: appSurfaceCode,
      model_code: modelCode,
      task_domain_code: taskDomainCode,
      task_title: taskTitle,
      source_app_ref: sourceAppRef,
      source_request_ref: sourceRequestRef,
      source_route_code: sourceRouteCode,
      idempotency_key: idempotencyKey
    },
    aiworker_response: responseJson
  };
}



// AICM_RUNTIME_STATUS_PANEL_AXT_R9_R1_V1
// Reusable AIWorkerOS runtime read-only proxy helpers.
// Browser calls local app server only. AIWorkerOS token stays server-side.
function aicmRuntimeStatusAiworkerBaseUrl() {
  return String(process.env.PERSONA_AIWORKEROS_BASE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
}

function aicmRuntimeStatusAiworkerHeaders() {
  const headers = { "accept": "application/json" };
  const token = String(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "").trim();

  if (token) {
    headers.authorization = "Bearer " + token;
  }

  return headers;
}

async function aicmRuntimeStatusAiworkerGet(pathname, searchParams) {
  const base = aicmRuntimeStatusAiworkerBaseUrl();
  const params = new URLSearchParams();

  if (searchParams && typeof searchParams.forEach === "function") {
    searchParams.forEach((value, key) => {
      if (key && value !== undefined && value !== null && String(value).length > 0) {
        params.set(key, String(value));
      }
    });
  }

  const upstreamUrl = base + pathname + (params.toString() ? "?" + params.toString() : "");
  const response = await fetch(upstreamUrl, {
    method: "GET",
    headers: aicmRuntimeStatusAiworkerHeaders()
  });

  const text = await response.text();

  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    payload = { raw_text: text };
  }

  if (!response.ok) {
    return {
      result: "error",
      api_identifier: SERVER_MARK,
      upstream_status_code: response.status,
      upstream_path: pathname,
      error_message: "AIWorkerOS runtime GET failed: " + String(response.status),
      upstream_payload: payload
    };
  }

  return {
    result: "ok",
    api_identifier: SERVER_MARK,
    upstream_status_code: response.status,
    upstream_path: pathname,
    payload
  };
}

// AICM_R8Z_A_LEADER_AUTO_DECOMPOSITION_START

function aicmR8zAutoText(value) {
  if (value === null || typeof value === "undefined") return "";
  return String(value).trim();
}

function aicmR8zAutoMode(value) {
  const text = aicmR8zAutoText(value).toLowerCase();
  return text === "pending" ? "pending" : "single";
}

function aicmR8zAutoVersion(value) {
  const text = aicmR8zAutoText(value);
  return text || "r8z_v1";
}

function aicmR8zAutoLimit(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) return 1;
  return Math.min(10, Math.floor(num));
}

function runLeaderAutoDecomposition(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const mode = aicmR8zAutoMode(body.mode);
  const limit = aicmR8zAutoLimit(body.limit);
  const version = aicmR8zAutoVersion(body.auto_decomposition_version);
  const sourceAppRef = aicmR8zAutoText(body.source_app_ref) || "AICompanyManager";
  const majorId = body.aicm_manager_major_work_item_id
    ? requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id")
    : "";

  if (mode === "single" && !majorId) {
    throw new Error("aicm_manager_major_work_item_id is required for single mode");
  }

  const targetWhere = mode === "single"
    ? "    AND m.aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid"
    : "    AND m.aicm_manager_major_work_item_id IS NOT NULL";

  const sql = [
    "WITH input_request AS (",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid AS owner_civilization_id,",
    "    " + sqlLiteral(companyId) + "::uuid AS aicm_user_company_id,",
    "    " + sqlLiteral(version) + "::text AS auto_decomposition_version,",
    "    " + sqlLiteral(sourceAppRef) + "::text AS source_app_ref,",
    "    " + String(limit) + "::int AS max_count",
    "), target_major AS (",
    "  SELECT m.*",
    "  FROM business.aicm_manager_major_work_item m",
    "  JOIN input_request r",
    "    ON r.owner_civilization_id = m.owner_civilization_id",
    "   AND r.aicm_user_company_id = m.aicm_user_company_id",
    "  WHERE m.decomposition_status_code = " + sqlLiteral("assigned_to_leader"),
    "    AND m.handoff_status_code = " + sqlLiteral("handed_off"),
    targetWhere,
    "    AND NOT EXISTS (",
    "      SELECT 1",
    "      FROM business.aicm_leader_middle_work_item existing",
    "      WHERE existing.aicm_manager_major_work_item_id = m.aicm_manager_major_work_item_id",
    "        AND existing.owner_civilization_id = m.owner_civilization_id",
    "        AND existing.aicm_user_company_id = m.aicm_user_company_id",
    "        AND existing.breakdown_status_code <> " + sqlLiteral("archived"),
    "    )",
    "  ORDER BY m.updated_at, m.display_order, m.created_at",
    "  LIMIT (SELECT max_count FROM input_request)",
    "), selected_worker AS (",
    "  SELECT DISTINCT ON (tm.aicm_manager_major_work_item_id)",
    "    tm.aicm_manager_major_work_item_id,",
    "    p.aiworker_model_code,",
    "    COALESCE(NULLIF(p.internal_nickname, ''), p.aiworker_model_code, " + sqlLiteral("未割当") + ") AS worker_label",
    "  FROM target_major tm",
    "  LEFT JOIN business.aicm_user_company_worker_placement p",
    "    ON p.owner_civilization_id = tm.owner_civilization_id",
    "   AND p.aicm_user_company_id = tm.aicm_user_company_id",
    "   AND p.role_code = " + sqlLiteral("Worker"),
    "   AND p.status_code = " + sqlLiteral("active"),
    "  ORDER BY",
    "    tm.aicm_manager_major_work_item_id,",
    "    CASE",
    "      WHEN p.aicm_user_company_section_id IS NOT NULL AND p.aicm_user_company_section_id = tm.aicm_user_company_section_id THEN 1",
    "      WHEN p.aicm_user_company_department_id IS NOT NULL AND p.aicm_user_company_department_id = tm.aicm_user_company_department_id THEN 2",
    "      WHEN p.target_level_code = " + sqlLiteral("company") + " THEN 3",
    "      ELSE 9",
    "    END,",
    "    p.created_at",
    "), inserted_middle AS (",
    "  INSERT INTO business.aicm_leader_middle_work_item (",
    "    owner_civilization_id, aicm_user_company_id, aicm_manager_major_work_item_id,",
    "    aicm_user_company_department_id, aicm_user_company_section_id,",
    "    middle_item_name, middle_item_description, leader_robot_label,",
    "    breakdown_status_code, handoff_status_code, priority_code, due_date,",
    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb",
    "  )",
    "  SELECT",
    "    tm.owner_civilization_id, tm.aicm_user_company_id, tm.aicm_manager_major_work_item_id,",
    "    tm.aicm_user_company_department_id, tm.aicm_user_company_section_id,",
    "    tm.major_item_name, tm.major_item_description,",
    "    COALESCE(NULLIF(tm.assigned_leader_label, ''), " + sqlLiteral("自動割当") + "),",
    "    " + sqlLiteral("worker_units_created") + ", " + sqlLiteral("handed_off") + ", tm.priority_code, tm.due_date,",
    "    tm.reference_files_text, tm.supplemental_materials_text, tm.applicable_rules_text,",
    "    " + sqlLiteral("R8Z auto-generated from Manager大項目") + ", '', tm.display_order,",
    "    jsonb_build_object(",
    "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
    "      " + sqlLiteral("auto_decomposition_source") + ", " + sqlLiteral("manager_major") + ",",
    "      " + sqlLiteral("source_app_ref") + ", (SELECT source_app_ref FROM input_request),",
    "      " + sqlLiteral("source_manager_major_work_item_id") + ", tm.aicm_manager_major_work_item_id::text",
    "    )",
    "  FROM target_major tm",
    "  RETURNING *",
    "), inserted_requirement AS (",
    "  INSERT INTO business.aicm_leader_deliverable_requirement (",
    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id,",
    "    deliverable_name, deliverable_type_code, deliverable_description,",
    "    required_quality_text, acceptance_criteria_text, review_required_flag, requirement_status_code,",
    "    priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb",
    "  )",
    "  SELECT",
    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id,",
    "    im.middle_item_name || " + sqlLiteral(" 成果物") + ", " + sqlLiteral("operation") + ", im.middle_item_description,",
    "    " + sqlLiteral("会社共通ルールと該当業務ルールに従い、後続Workerが実行可能な成果物にする") + ",",
    "    " + sqlLiteral("大項目の目的を満たし、レビュー可能な作業結果が作成されていること") + ",",
    "    true, " + sqlLiteral("ready_for_worker") + ", im.priority_code, im.due_date,",
    "    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,",
    "    " + sqlLiteral("R8Z auto-generated deliverable requirement") + ", '', im.display_order,",
    "    jsonb_build_object(",
    "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
    "      " + sqlLiteral("source_leader_middle_work_item_id") + ", im.aicm_leader_middle_work_item_id::text,",
    "      " + sqlLiteral("source_manager_major_work_item_id") + ", im.aicm_manager_major_work_item_id::text",
    "    )",
    "  FROM inserted_middle im",
    "  RETURNING *",
    "), inserted_worker_unit AS (",
    "  INSERT INTO business.aicm_worker_work_unit (",
    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id, aicm_leader_deliverable_requirement_id,",
    "    work_unit_name, work_unit_description, work_type_code,",
    "    assigned_worker_label, worker_model_code, work_status_code, review_status_code,",
    "    priority_code, due_date, input_context_text, expected_output_text, result_summary_text, handoff_link,",
    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, display_order, metadata_jsonb",
    "  )",
    "  SELECT",
    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id,",
    "    im.middle_item_name || " + sqlLiteral(" 作業") + ", im.middle_item_description, " + sqlLiteral("operation") + ",",
    "    COALESCE(sw.worker_label, " + sqlLiteral("未割当") + "), COALESCE(sw.aiworker_model_code, ''), " + sqlLiteral("todo") + ", " + sqlLiteral("required") + ",",
    "    im.priority_code, im.due_date,",
    "    " + sqlLiteral("Manager大項目: ") + " || im.middle_item_name || E'\\n' || im.middle_item_description,",
    "    " + sqlLiteral("指定された大項目について、実行可能な成果物または作業結果を作成する") + ",",
    "    '', '',",
    "    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,",
    "    CASE WHEN sw.aiworker_model_code IS NULL THEN " + sqlLiteral("Worker未割当。配置後に再割当対象。") + " ELSE " + sqlLiteral("R8Z auto-generated worker work unit") + " END,",
    "    im.display_order,",
    "    jsonb_build_object(",
    "      " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
    "      " + sqlLiteral("source_leader_middle_work_item_id") + ", im.aicm_leader_middle_work_item_id::text,",
    "      " + sqlLiteral("source_deliverable_requirement_id") + ", ir.aicm_leader_deliverable_requirement_id::text,",
    "      " + sqlLiteral("source_manager_major_work_item_id") + ", im.aicm_manager_major_work_item_id::text",
    "    )",
    "  FROM inserted_middle im",
    "  JOIN inserted_requirement ir ON ir.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",
    "  LEFT JOIN selected_worker sw ON sw.aicm_manager_major_work_item_id = im.aicm_manager_major_work_item_id",
    "  RETURNING *",
    "), updated_manager AS (",
    "  UPDATE business.aicm_manager_major_work_item m",
    "  SET decomposition_status_code = " + sqlLiteral("decomposed") + ",",
    "      handoff_status_code = " + sqlLiteral("completed") + ",",
    "      metadata_jsonb = COALESCE(m.metadata_jsonb, '{}'::jsonb) || jsonb_build_object(",
    "        " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
    "        " + sqlLiteral("auto_decomposition_completed_at") + ", now()::text",
    "      ),",
    "      updated_at = now()",
    "  FROM inserted_middle im",
    "  WHERE m.aicm_manager_major_work_item_id = im.aicm_manager_major_work_item_id",
    "  RETURNING m.*",
    "), skipped_existing AS (",
    "  SELECT m.aicm_manager_major_work_item_id",
    "  FROM business.aicm_manager_major_work_item m",
    "  JOIN input_request r ON r.owner_civilization_id = m.owner_civilization_id AND r.aicm_user_company_id = m.aicm_user_company_id",
    "  WHERE m.decomposition_status_code = " + sqlLiteral("assigned_to_leader"),
    "    AND m.handoff_status_code = " + sqlLiteral("handed_off"),
    targetWhere,
    "    AND EXISTS (",
    "      SELECT 1",
    "      FROM business.aicm_leader_middle_work_item existing",
    "      WHERE existing.aicm_manager_major_work_item_id = m.aicm_manager_major_work_item_id",
    "        AND existing.breakdown_status_code <> " + sqlLiteral("archived"),
    "    )",
    "), final_items AS (",
    "  SELECT im.aicm_manager_major_work_item_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id, iw.aicm_worker_work_unit_id, " + sqlLiteral("created") + "::text AS status",
    "  FROM inserted_middle im",
    "  LEFT JOIN inserted_requirement ir ON ir.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",
    "  LEFT JOIN inserted_worker_unit iw ON iw.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id",
    "  UNION ALL",
    "  SELECT se.aicm_manager_major_work_item_id, NULL::uuid, NULL::uuid, NULL::uuid, " + sqlLiteral("skipped_existing_decomposition") + "::text AS status",
    "  FROM skipped_existing se",
    ")",
    "SELECT jsonb_build_object(",
    "  " + sqlLiteral("result") + ", " + sqlLiteral("ok") + ",",
    "  " + sqlLiteral("api_identifier") + ", " + sqlLiteral(SERVER_MARK) + ",",
    "  " + sqlLiteral("auto_decomposition_version") + ", (SELECT auto_decomposition_version FROM input_request),",
    "  " + sqlLiteral("processed_manager_major_count") + ", (SELECT count(*) FROM updated_manager),",
    "  " + sqlLiteral("created_leader_middle_count") + ", (SELECT count(*) FROM inserted_middle),",
    "  " + sqlLiteral("created_deliverable_requirement_count") + ", (SELECT count(*) FROM inserted_requirement),",
    "  " + sqlLiteral("created_worker_work_unit_count") + ", (SELECT count(*) FROM inserted_worker_unit),",
    "  " + sqlLiteral("skipped_count") + ", (SELECT count(*) FROM skipped_existing),",
    "  " + sqlLiteral("items") + ", COALESCE((SELECT jsonb_agg(to_jsonb(final_items)) FROM final_items), '[]'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

// AICM_R8Z_A_LEADER_AUTO_DECOMPOSITION_END



// AICM_R8Z_I_WORKER_AUTO_EXECUTION_SERVER_START
function aicmR8ZIText(value) {
  if (value === null || typeof value === "undefined") return "";
  return String(value).trim();
}

function aicmR8ZIOptionalUuidSql(value) {
  const text = aicmR8ZIText(value);
  return text ? sqlLiteral(text) + "::uuid" : "NULL";
}

function aicmR8ZIJsonSql(value) {
  return sqlLiteral(JSON.stringify(value || {})) + "::jsonb";
}

function workerAutoExecutionCandidatesR8ZI(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const managerMajorId = aicmR8ZIText(body.aicm_manager_major_work_item_id || body.related_manager_major_work_item_id);
  const workerWorkUnitId = aicmR8ZIText(body.aicm_worker_work_unit_id || body.related_worker_work_unit_id);
  const limit = Math.max(1, Math.min(20, Number(body.limit || 10)));

  const managerFilter = managerMajorId
    ? "    AND w.aicm_manager_major_work_item_id = " + sqlLiteral(managerMajorId) + "::uuid"
    : "";

  const workerFilter = workerWorkUnitId
    ? "    AND w.aicm_worker_work_unit_id = " + sqlLiteral(workerWorkUnitId) + "::uuid"
    : "";

  const sql = [
    "WITH target_units AS (",
    "  SELECT w.*",
    "  FROM business.vw_aicm_pmlw_worker_work_unit_display w",
    "  WHERE w.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND w.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND COALESCE(w.work_status_code, '') = 'todo'",
    "    AND COALESCE(w.worker_model_code, '') <> ''",
    "    AND COALESCE(w.assigned_worker_label, '') <> ''",
    managerFilter,
    workerFilter,
    "  ORDER BY w.priority_code DESC, w.created_at ASC, w.display_order ASC",
    "  LIMIT " + String(limit),
    "), worker_candidates AS (",
    "  SELECT",
    "    u.aicm_worker_work_unit_id,",
    "    p.aicm_user_company_worker_placement_id,",
    "    p.owner_civilization_id,",
    "    p.aicm_user_company_id,",
    "    p.aicm_user_company_department_id,",
    "    p.aicm_user_company_section_id,",
    "    p.aiworker_model_code,",
    "    p.internal_nickname,",
    "    COALESCE(v.display_label, NULLIF(p.internal_nickname, '') || '@' || p.role_code, p.aiworker_model_code || '@' || p.role_code) AS display_label,",
    "    CASE",
    "      WHEN p.aiworker_model_code = u.worker_model_code AND COALESCE(NULLIF(p.internal_nickname, ''), '') = u.assigned_worker_label THEN 100",
    "      WHEN p.aiworker_model_code = u.worker_model_code THEN 80",
    "      WHEN COALESCE(NULLIF(p.internal_nickname, ''), '') = u.assigned_worker_label THEN 60",
    "      ELSE 10",
    "    END AS match_score",
    "  FROM target_units u",
    "  JOIN business.aicm_user_company_worker_placement p",
    "    ON p.owner_civilization_id = u.owner_civilization_id",
    "   AND p.aicm_user_company_id = u.aicm_user_company_id",
    "   AND p.role_code = 'Worker'",
    "   AND p.status_code = 'active'",
    "  LEFT JOIN business.vw_aicm_user_company_worker_placement_display v",
    "    ON v.aicm_user_company_worker_placement_id = p.aicm_user_company_worker_placement_id",
    "), ranked AS (",
    "  SELECT *, row_number() OVER (PARTITION BY aicm_worker_work_unit_id ORDER BY match_score DESC, aicm_user_company_worker_placement_id) AS rn",
    "  FROM worker_candidates",
    ")",
    "SELECT COALESCE(jsonb_agg(",
    "  jsonb_build_object(",
    "    'worker_work_unit', to_jsonb(u),",
    "    'worker_placement', to_jsonb(r)",
    "  ) ORDER BY u.created_at, u.display_order",
    "), '[]'::jsonb)::text",
    "FROM target_units u",
    "LEFT JOIN ranked r",
    "  ON r.aicm_worker_work_unit_id = u.aicm_worker_work_unit_id",
    " AND r.rn = 1;"
  ].filter(Boolean).join("\n");

  const result = runPsqlJson(sql);
  return Array.isArray(result) ? result : [];
}

function buildWorkerRuntimeRequestBodyR8ZI(pair) {
  const unit = pair && pair.worker_work_unit ? pair.worker_work_unit : {};
  const placement = pair && pair.worker_placement ? pair.worker_placement : {};

  const unitId = aicmR8ZIText(unit.aicm_worker_work_unit_id);
  const placementId = aicmR8ZIText(placement.aicm_user_company_worker_placement_id);
  const modelCode = aicmR8ZIText(placement.aiworker_model_code || unit.worker_model_code);
  const title = aicmR8ZIText(unit.work_unit_name) || "Worker作業単位";

  const instructionParts = [
    unit.work_unit_description,
    unit.input_context_text,
    unit.expected_output_text,
    aicmR8ZIText(unit.reference_files_text) ? "参照ファイル: " + aicmR8ZIText(unit.reference_files_text) : "",
    aicmR8ZIText(unit.supplemental_materials_text) ? "補足資料: " + aicmR8ZIText(unit.supplemental_materials_text) : "",
    aicmR8ZIText(unit.applicable_rules_text) ? "会社共通ルール/適用ルール: " + aicmR8ZIText(unit.applicable_rules_text) : ""
  ].map(aicmR8ZIText).filter(Boolean);

  if (!unitId) throw new Error("worker_work_unit_id missing");
  if (!placementId) throw new Error("worker placement missing for " + unitId);
  if (!modelCode) throw new Error("model_code missing for " + unitId);
  if (!instructionParts.length) throw new Error("instruction missing for " + unitId);

  return {
    owner_civilization_id: aicmR8ZIText(unit.owner_civilization_id),
    aicm_user_company_id: aicmR8ZIText(unit.aicm_user_company_id),
    aicm_user_company_department_id: aicmR8ZIText(placement.aicm_user_company_department_id || unit.aicm_user_company_department_id),
    aicm_user_company_section_id: aicmR8ZIText(placement.aicm_user_company_section_id || unit.aicm_user_company_section_id),
    aicm_user_company_worker_placement_id: placementId,
    model_code: modelCode,
    task_domain_code: aicmR8ZIText(unit.work_type_code) || "business_operation",
    title,
    instruction: instructionParts.join("\n\n"),
    source_request_ref: "aicm_worker_work_unit:" + unitId,
    source_app_ref: "AICompanyManager",
    related_worker_work_unit_id: unitId,
    related_leader_middle_work_item_id: aicmR8ZIText(unit.aicm_leader_middle_work_item_id),
    related_deliverable_requirement_id: aicmR8ZIText(unit.aicm_leader_deliverable_requirement_id),
    review_required_flag: ["required", "waiting"].includes(aicmR8ZIText(unit.review_status_code)),
    priority_code: aicmR8ZIText(unit.priority_code) || "normal"
  };
}

function markWorkerUnitAutoExecutionStartedR8ZI(unitId, runtimePayload) {
  const unit = requiredUuid(unitId, "aicm_worker_work_unit_id");

  const metadata = {
    auto_execution: "worker_runtime_request",
    auto_execution_version: "r8z_i",
    source_request_ref: runtimePayload && runtimePayload.request_body ? runtimePayload.request_body.source_request_ref : "",
    runtime_result: runtimePayload || {},
    started_at: new Date().toISOString()
  };

  const sql = [
    "UPDATE business.aicm_worker_work_unit",
    "SET work_status_code = 'in_progress',",
    "    metadata_jsonb = COALESCE(metadata_jsonb, '{}'::jsonb) || " + aicmR8ZIJsonSql(metadata) + ",",
    "    updated_at = now()",
    "WHERE aicm_worker_work_unit_id = " + sqlLiteral(unit) + "::uuid",
    "  AND work_status_code = 'todo'",
    "RETURNING jsonb_build_object(",
    "  'aicm_worker_work_unit_id', aicm_worker_work_unit_id,",
    "  'work_status_code', work_status_code,",
    "  'metadata_jsonb', metadata_jsonb",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}


// AICM_V10L_C2G_B6R8R1_AIWORKEROS_WAITING_METADATA_HELPER_START
function aicmIsAiworkerRuntimeUnavailableB6R8R1(message) {
  const text = String(message || "").toLowerCase();

  return (
    text.includes("fetch failed") ||
    text.includes("econnrefused") ||
    text.includes("enotfound") ||
    text.includes("etimedout") ||
    text.includes("und_err") ||
    text.includes("socket") ||
    text.includes("network") ||
    text.includes("aiworkeros runtime request failed") ||
    text.includes("persona_aiworkeros_base_url") ||
    text.includes("persona_aiworkeros_auth_token")
  );
}

function markWorkerUnitAiworkerWaitingMetadataB6R8R1(unitId, detail) {
  const unit = requiredUuid(unitId, "aicm_worker_work_unit_id");
  const rawMessage = detail && detail.error_message ? String(detail.error_message) : "AIWorkerOS is not reachable.";
  const message = rawMessage.length > 500 ? rawMessage.slice(0, 500) : rawMessage;
  const waitText = "AIWorkerOS実行待ち: " + message;

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_worker_work_unit",
    "  SET work_status_code = COALESCE(NULLIF(work_status_code, ''), " + sqlLiteral("todo") + "),",
    "      review_status_code = COALESCE(NULLIF(review_status_code, ''), " + sqlLiteral("required") + "),",
    "      result_summary_text = CASE",
    "        WHEN NULLIF(result_summary_text, '') IS NULL THEN " + sqlLiteral(waitText),
    "        WHEN result_summary_text ILIKE " + sqlLiteral("%AIWorkerOS実行待ち%") + " THEN result_summary_text",
    "        ELSE result_summary_text || E'\\n' || " + sqlLiteral(waitText),
    "      END,",
    "      note = CASE",
    "        WHEN NULLIF(note, '') IS NULL THEN " + sqlLiteral(waitText),
    "        WHEN note ILIKE " + sqlLiteral("%AIWorkerOS実行待ち%") + " THEN note",
    "        ELSE note || E'\\n' || " + sqlLiteral(waitText),
    "      END,",
    "      metadata_jsonb = COALESCE(metadata_jsonb, '{}'::jsonb) || jsonb_build_object(",
    "        " + sqlLiteral("aiworkeros_execution_state") + ", " + sqlLiteral("waiting") + ",",
    "        " + sqlLiteral("aiworkeros_retryable") + ", true,",
    "        " + sqlLiteral("aiworkeros_last_error") + ", " + sqlLiteral(message) + ",",
    "        " + sqlLiteral("aiworkeros_last_error_at") + ", now()::text,",
    "        " + sqlLiteral("aiworkeros_waiting_source") + ", " + sqlLiteral("worker-auto-execution/run") + "",
    "      ),",
    "      updated_at = now()",
    "  WHERE aicm_worker_work_unit_id = " + sqlLiteral(unit) + "::uuid",
    "    AND COALESCE(work_status_code, '') IN ('todo', 'in_progress')",
    "    AND NOT EXISTS (",
    "      SELECT 1",
    "      FROM business.aicm_human_review_item h",
    "      WHERE h.related_worker_work_unit_id = business.aicm_worker_work_unit.aicm_worker_work_unit_id",
    "    )",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_updated' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'aiworkeros_execution_state', " + sqlLiteral("waiting") + ",",
    "  'retryable', true,",
    "  'worker_work_unit', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text",
    "FROM (SELECT 1) s;"
  ].join("\n");

  return runPsqlJson(sql);
}
// AICM_V10L_C2G_B6R8R1_AIWORKEROS_WAITING_METADATA_HELPER_END

// AICM_V10L_C2G_B6R9R2_CLEAR_WAITING_ON_SUCCESS_HELPER_START
function markWorkerUnitAiworkerAcceptedMetadataB6R9R2(unitId, detail) {
  const unit = requiredUuid(unitId, "aicm_worker_work_unit_id");
  const runtimeRequest = detail && detail.runtime_request && typeof detail.runtime_request === "object"
    ? detail.runtime_request
    : {};
  const aiworkerResponse = detail && detail.aiworker_response && typeof detail.aiworker_response === "object"
    ? detail.aiworker_response
    : {};

  const requestId = aicmR8ZIText(runtimeRequest.request_id || aiworkerResponse.request_id || "");
  const requestCode = aicmR8ZIText(runtimeRequest.request_code || aiworkerResponse.request_code || "");
  const statusCode = aicmR8ZIText(runtimeRequest.request_status_code || aiworkerResponse.status || "REQUESTED_INTERNAL_ONLY");
  const acceptedText = "AIWorkerOS再実行受付済み" + (requestId ? ": " + requestId : "");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_worker_work_unit",
    "  SET metadata_jsonb = (COALESCE(metadata_jsonb, '{}'::jsonb) - 'aiworkeros_last_error' - 'aiworkeros_last_error_at') || jsonb_build_object(",
    "        " + sqlLiteral("aiworkeros_execution_state") + ", " + sqlLiteral("accepted") + ",",
    "        " + sqlLiteral("aiworkeros_retryable") + ", false,",
    "        " + sqlLiteral("aiworkeros_waiting_resolved_at") + ", now()::text,",
    "        " + sqlLiteral("aiworkeros_accepted_at") + ", now()::text,",
    "        " + sqlLiteral("aiworkeros_request_id") + ", " + sqlLiteral(requestId) + ",",
    "        " + sqlLiteral("aiworkeros_request_code") + ", " + sqlLiteral(requestCode) + ",",
    "        " + sqlLiteral("aiworkeros_status_code") + ", " + sqlLiteral(statusCode) + "",
    "      ),",
    "      note = CASE",
    "        WHEN NULLIF(note, '') IS NULL THEN " + sqlLiteral(acceptedText),
    "        WHEN note ILIKE " + sqlLiteral("%AIWorkerOS再実行受付済み%") + " THEN note",
    "        ELSE note || E'\\n' || " + sqlLiteral(acceptedText),
    "      END,",
    "      updated_at = now()",
    "  WHERE aicm_worker_work_unit_id = " + sqlLiteral(unit) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_updated' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'aiworkeros_execution_state', " + sqlLiteral("accepted") + ",",
    "  'retryable', false,",
    "  'worker_work_unit', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text",
    "FROM (SELECT 1) s;"
  ].join("\n");

  return runPsqlJson(sql);
}
// AICM_V10L_C2G_B6R9R2_CLEAR_WAITING_ON_SUCCESS_HELPER_END



/* AICM_V10L_C2G_B6R7_WORKER_REVIEW_CREATE_HELPER_START */
function aicmB6r7Text(value) {
  if (value === null || typeof value === "undefined") return "";
  return String(value).trim();
}

function aicmB6r7Json(value) {
  try {
    return JSON.stringify(value && typeof value === "object" ? value : {});
  } catch (_) {
    return "{}";
  }
}

function completeWorkerAutoExecutionAndCreateHumanReviewB6R7(unitId, detail) {
  const unit = requiredUuid(unitId, "aicm_worker_work_unit_id");
  const safeDetail = detail && typeof detail === "object" ? detail : {};
  const aiworkerResponse = safeDetail.aiworker_response && typeof safeDetail.aiworker_response === "object"
    ? safeDetail.aiworker_response
    : {};
  const runtimeRequest = safeDetail.runtime_request && typeof safeDetail.runtime_request === "object"
    ? safeDetail.runtime_request
    : {};

  // AICM_V10L_C2G_B6R43R4_ROUTE_METADATA_SQL_VARS_START
  const b6r43r4RuntimeRequestId = aicmB6r7Text(
    runtimeRequest.request_id ||
    runtimeRequest.runtime_execution_request_id ||
    ""
  );
  const b6r43r4RuntimeRequestIdSql = sqlLiteral(b6r43r4RuntimeRequestId);
  const b6r43r4WorkerMetaExpr = "COALESCE(w.metadata_jsonb, '{}'::jsonb)";
  const b6r43r4MetaTextExpr = function b6r43r4MetaTextExpr(key) {
    return b6r43r4WorkerMetaExpr + "->>" + sqlLiteral(key);
  };
  const b6r43r4MetaNullIfExpr = function b6r43r4MetaNullIfExpr(key) {
    return "NULLIF(" + b6r43r4MetaTextExpr(key) + ", '')";
  };
  const b6r43r4RouteIndividualSql = sqlLiteral("individual_instruction");
  const b6r43r4RoutePresidentSql = sqlLiteral("president_route_worker");
  const b6r43r4ReviewRouteExpr = [
    "COALESCE(",
    b6r43r4MetaNullIfExpr("source_route_code"),
    ", CASE ",
    "WHEN " + b6r43r4MetaNullIfExpr("source_president_policy_id") + " IS NOT NULL THEN " + b6r43r4RoutePresidentSql + " ",
    "WHEN " + b6r43r4MetaNullIfExpr("source_manager_major_work_item_id") + " IS NOT NULL THEN " + sqlLiteral("task_ledger_worker") + " ",
    "WHEN NULLIF(" + b6r43r4RuntimeRequestIdSql + ", '') IS NOT NULL THEN " + b6r43r4RouteIndividualSql + " ",
    "ELSE " + sqlLiteral("worker_auto_execution") + " END)",
  ].join("");
  const b6r43r4ReturnTargetTypeExpr = [
    "COALESCE(",
    b6r43r4MetaNullIfExpr("return_target_type"),
    ", CASE WHEN " + b6r43r4ReviewRouteExpr + " = " + b6r43r4RouteIndividualSql,
    " THEN " + sqlLiteral("workbench_runtime_request"),
    " ELSE " + sqlLiteral("worker_work_unit") + " END)",
  ].join("");
  const b6r43r4ReturnTargetIdExpr = [
    "COALESCE(",
    b6r43r4MetaNullIfExpr("return_target_id"),
    ", CASE WHEN " + b6r43r4ReviewRouteExpr + " = " + b6r43r4RouteIndividualSql,
    " THEN NULLIF(" + b6r43r4RuntimeRequestIdSql + ", '')",
    " ELSE w.aicm_worker_work_unit_id::text END)",
  ].join("");
  const b6r43r4ReexecuteTargetTypeExpr = [
    "COALESCE(",
    b6r43r4MetaNullIfExpr("reexecute_target_type"),
    ", CASE WHEN " + b6r43r4ReviewRouteExpr + " = " + b6r43r4RouteIndividualSql,
    " THEN " + sqlLiteral("runtime_request"),
    " ELSE " + sqlLiteral("worker_work_unit") + " END)",
  ].join("");
  const b6r43r4ReexecuteTargetIdExpr = [
    "COALESCE(",
    b6r43r4MetaNullIfExpr("reexecute_target_id"),
    ", CASE WHEN " + b6r43r4ReviewRouteExpr + " = " + b6r43r4RouteIndividualSql,
    " THEN NULLIF(" + b6r43r4RuntimeRequestIdSql + ", '')",
    " ELSE w.aicm_worker_work_unit_id::text END)",
  ].join("");
  const b6r43r4ContextRestoreTypeExpr = [
    "COALESCE(",
    b6r43r4MetaNullIfExpr("context_restore_type"),
    ", CASE WHEN " + b6r43r4ReviewRouteExpr + " = " + b6r43r4RoutePresidentSql,
    " THEN " + sqlLiteral("president_route"),
    " WHEN " + b6r43r4ReviewRouteExpr + " = " + b6r43r4RouteIndividualSql,
    " THEN " + sqlLiteral("workbench"),
    " ELSE " + sqlLiteral("task_ledger") + " END)",
  ].join("");
  const b6r43r4ContextRestoreIdExpr = [
    "COALESCE(",
    b6r43r4MetaNullIfExpr("context_restore_id"),
    ", " + b6r43r4MetaNullIfExpr("source_manager_major_work_item_id"),
    ", " + b6r43r4MetaNullIfExpr("source_president_policy_id"),
    ", CASE WHEN " + b6r43r4ReviewRouteExpr + " = " + b6r43r4RouteIndividualSql,
    " THEN NULLIF(" + b6r43r4RuntimeRequestIdSql + ", '')",
    " ELSE w.aicm_worker_work_unit_id::text END)",
  ].join("");
  // AICM_V10L_C2G_B6R43R4_ROUTE_METADATA_SQL_VARS_END

  const responseSummary = aicmB6r7Text(
    aiworkerResponse.result_summary_text ||
    aiworkerResponse.delivery_summary_text ||
    aiworkerResponse.summary ||
    aiworkerResponse.message ||
    runtimeRequest.result_summary_text ||
    runtimeRequest.summary ||
    ""
  );

  const aiReviewText = aicmB6r7Text(
    aiworkerResponse.ai_review_result_text ||
    aiworkerResponse.review_summary ||
    "AIレビュー: Worker自動実行結果を確認済み。"
  );

  const detailJson = aicmB6r7Json(safeDetail);

  const sql = [
    "WITH target AS (",
    "  SELECT",
    "    w.*,",
    "    l.aicm_manager_major_work_item_id,",
    "    l.aicm_user_company_department_id,",
    "    l.aicm_user_company_section_id,",
    "    r.review_required_flag,",
    "    r.deliverable_name,",
    "    m.aicm_president_policy_id,",
    "    m.major_item_name,",
    "    m.major_item_description",
    "  FROM business.aicm_worker_work_unit w",
    "  JOIN business.aicm_leader_middle_work_item l",
    "    ON l.aicm_leader_middle_work_item_id = w.aicm_leader_middle_work_item_id",
    "  LEFT JOIN business.aicm_leader_deliverable_requirement r",
    "    ON r.aicm_leader_deliverable_requirement_id = w.aicm_leader_deliverable_requirement_id",
    "  LEFT JOIN business.aicm_manager_major_work_item m",
    "    ON m.aicm_manager_major_work_item_id = l.aicm_manager_major_work_item_id",
    "  WHERE w.aicm_worker_work_unit_id = " + sqlLiteral(unit) + "::uuid",
    "  LIMIT 1",
    "), summary_value AS (",
    "  SELECT",
    "    COALESCE(",
    "      NULLIF(" + sqlLiteral(responseSummary) + ", ''),",
    "      " + sqlLiteral("AIWorkerOS成果物回収: ") + " || COALESCE(NULLIF(t.work_unit_name, ''), " + sqlLiteral("Worker作業") + ") ||",
    "      " + sqlLiteral(" / ") + " || COALESCE(NULLIF(t.work_unit_description, ''), NULLIF(t.expected_output_text, ''), NULLIF(t.major_item_description, ''), " + sqlLiteral("指定された作業結果を作成する") + ")",
    "    ) AS delivery_summary_text",
    "  FROM target t",
    "), updated_worker AS (",
    "  UPDATE business.aicm_worker_work_unit w",
    "  SET work_status_code = " + sqlLiteral("review_waiting") + ",",
    "      review_status_code = " + sqlLiteral("waiting") + ",",
    "      result_summary_text = (SELECT delivery_summary_text FROM summary_value),",
    "      metadata_jsonb = COALESCE(w.metadata_jsonb, '{}'::jsonb) || jsonb_build_object(",
          // AICM_V10L_C2G_B6R43R4_ROUTE_METADATA_JSONB_MERGE_START
          sqlLiteral("source_route_code") + ", " + b6r43r4ReviewRouteExpr + ",",
          sqlLiteral("return_target_type") + ", " + b6r43r4ReturnTargetTypeExpr + ",",
          sqlLiteral("return_target_id") + ", " + b6r43r4ReturnTargetIdExpr + ",",
          sqlLiteral("reexecute_target_type") + ", " + b6r43r4ReexecuteTargetTypeExpr + ",",
          sqlLiteral("reexecute_target_id") + ", " + b6r43r4ReexecuteTargetIdExpr + ",",
          sqlLiteral("context_restore_type") + ", " + b6r43r4ContextRestoreTypeExpr + ",",
          sqlLiteral("context_restore_id") + ", " + b6r43r4ContextRestoreIdExpr + ",",
          sqlLiteral("source_app_ref") + ", " + sqlLiteral("AICompanyManager") + ",",
          sqlLiteral("source_screen_code") + ", COALESCE(" + b6r43r4MetaNullIfExpr("source_screen_code") + ", CASE WHEN " + b6r43r4ReviewRouteExpr + " = " + b6r43r4RoutePresidentSql + " THEN " + sqlLiteral("president_route") + " WHEN " + b6r43r4ReviewRouteExpr + " = " + b6r43r4RouteIndividualSql + " THEN " + sqlLiteral("ai_execution_workbench") + " ELSE " + sqlLiteral("task_ledger") + " END),",
          // AICM_V10L_C2G_B6R43R4_ROUTE_METADATA_JSONB_MERGE_END
    "        " + sqlLiteral("worker_auto_execution_source") + ", " + sqlLiteral("worker-auto-execution/run") + ",",
    "        " + sqlLiteral("worker_auto_execution_completed_at") + ", now()::text,",
    "        " + sqlLiteral("worker_auto_execution_result") + ", " + sqlLiteral(detailJson) + "::jsonb",
    "      ),",
    "      updated_at = now()",
    "  WHERE w.aicm_worker_work_unit_id = " + sqlLiteral(unit) + "::uuid",
    "  RETURNING *",
    "), inserted_review AS (",
    "  INSERT INTO business.aicm_human_review_item (",
    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
    "    related_president_policy_id, related_manager_major_work_item_id, related_leader_middle_work_item_id,",
    "    related_deliverable_requirement_id, related_worker_work_unit_id,",
    "    review_kind_code, artifact_kind_code, review_title,",
    "    delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link,",
    "    responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date,",
    "    display_order, metadata_jsonb",
    "  )",
    "  SELECT",
    "    t.owner_civilization_id,",
    "    t.aicm_user_company_id,",
    "    t.aicm_user_company_department_id,",
    "    t.aicm_user_company_section_id,",
    "    t.aicm_president_policy_id,",
    "    t.aicm_manager_major_work_item_id,",
    "    t.aicm_leader_middle_work_item_id,",
    "    t.aicm_leader_deliverable_requirement_id,",
    "    t.aicm_worker_work_unit_id,",
    "    " + sqlLiteral("delivery_summary") + ",",
    "    " + sqlLiteral("delivery_package") + ",",
    "    " + sqlLiteral("納品サマリー確認: ") + " || COALESCE(NULLIF(t.work_unit_name, ''), " + sqlLiteral("Worker作業") + "),",
    "    (SELECT delivery_summary_text FROM summary_value),",
    "    '',",
    "    " + sqlLiteral(aiReviewText) + ",",
    "    '',",
    "    COALESCE(NULLIF(t.handoff_link, ''), ''),",
    "    COALESCE(NULLIF(t.assigned_worker_label, ''), " + sqlLiteral("AIWorker") + "),",
    "    " + sqlLiteral("AICompanyManager") + ",",
    "    " + sqlLiteral("pending") + ",",
    "    COALESCE(NULLIF(t.priority_code, ''), " + sqlLiteral("normal") + "),",
    "    t.due_date,",
    "    COALESCE(t.display_order, 100),",
    "    jsonb_build_object(",
    "      " + sqlLiteral("source") + ", " + sqlLiteral("worker-auto-execution/run") + ",",
    "      " + sqlLiteral("source_worker_work_unit_id") + ", t.aicm_worker_work_unit_id::text,",
    "      " + sqlLiteral("source_manager_major_work_item_id") + ", t.aicm_manager_major_work_item_id::text",
    "    )",
    "  FROM target t",
    "  WHERE COALESCE(t.review_required_flag, true) = true",
    "    AND EXISTS (SELECT 1 FROM updated_worker)",
    "    AND NOT EXISTS (",
    "      SELECT 1",
    "      FROM business.aicm_human_review_item h",
    "      WHERE h.related_worker_work_unit_id = t.aicm_worker_work_unit_id",
    "        AND COALESCE(h.human_review_status_code, '') <> " + sqlLiteral("archived"),
    "    )",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'updated_worker_count', (SELECT count(*) FROM updated_worker),",
    "  'created_human_review_count', (SELECT count(*) FROM inserted_review),",
    "  'updated_worker', COALESCE((SELECT to_jsonb(updated_worker) FROM updated_worker LIMIT 1), '{}'::jsonb),",
    "  'human_review_item', COALESCE((SELECT to_jsonb(inserted_review) FROM inserted_review LIMIT 1), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}
/* AICM_V10L_C2G_B6R7_WORKER_REVIEW_CREATE_HELPER_END */

async function runWorkerAutoExecutionR8ZI(body) {
  const dryRun = body && body.dry_run === true;
  const pairs = workerAutoExecutionCandidatesR8ZI(body || {});
  const executed = [];
  const failed = [];
  // AICM_V10L_C2G_B6R7_WORKER_AUTO_LOG_START
  const aicmB6r7Log = (phase, data) => {
    try {
      console.info("AICM_B6R7_WORKER_AUTO_EXECUTION", JSON.stringify({
        phase,
        at: new Date().toISOString(),
        dry_run: dryRun,
        body_keys: body && typeof body === "object" ? Object.keys(body).sort() : [],
        owner_civilization_id: body && body.owner_civilization_id || "",
        aicm_user_company_id: body && body.aicm_user_company_id || "",
        aicm_manager_major_work_item_id: body && body.aicm_manager_major_work_item_id || "",
        candidate_count: Array.isArray(pairs) ? pairs.length : -1,
        data: data || {}
      }));
    } catch (_) {}
  };
  aicmB6r7Log("start", {
    candidate_ids: Array.isArray(pairs) ? pairs.map((pair) => pair && pair.worker_work_unit ? pair.worker_work_unit.aicm_worker_work_unit_id : "") : []
  });
  // AICM_V10L_C2G_B6R7_WORKER_AUTO_LOG_END

  for (const pair of pairs) {
    const unit = pair && pair.worker_work_unit ? pair.worker_work_unit : {};
    const unitId = aicmR8ZIText(unit.aicm_worker_work_unit_id);

    try {
      const requestBody = buildWorkerRuntimeRequestBodyR8ZI(pair);

            if (dryRun) {
        // AICM_V10L_C2G_B6R9R5_DRYRUN_MARKRESULT_TDZ_FIX_START
        // dry_run must stop before runtime POST / markResult / human review creation.
        executed.push({
          aicm_worker_work_unit_id: unitId,
          dry_run: true,
          request_body: requestBody
        });
        continue;
        // AICM_V10L_C2G_B6R9R5_DRYRUN_MARKRESULT_TDZ_FIX_END
      }

      // AICM_V10L_C2G_B6R7_WORKER_AUTO_LOG_RUNTIME_START
      aicmB6r7Log("before_runtime_request", {
        aicm_worker_work_unit_id: unitId,
        work_unit_name: unit.work_unit_name || "",
        review_status_code: unit.review_status_code || "",
        work_status_code: unit.work_status_code || "",
        request_body_keys: requestBody && typeof requestBody === "object" ? Object.keys(requestBody).sort() : []
      });
      // AICM_V10L_C2G_B6R7_WORKER_AUTO_LOG_RUNTIME_END

      const runtimeResult = await createWorkerRuntimeRequest(requestBody);
      // AICM_V10L_C2G_B6R7_WORKER_AUTO_LOG_RUNTIME_RESULT_START
      aicmB6r7Log("after_runtime_request", {
        aicm_worker_work_unit_id: unitId,
        runtime_result: runtimeResult && runtimeResult.result || "",
        runtime_error: runtimeResult && (runtimeResult.error_message || runtimeResult.message || runtimeResult.error) || "",
        runtime_keys: runtimeResult && typeof runtimeResult === "object" ? Object.keys(runtimeResult).sort() : []
      });
      // AICM_V10L_C2G_B6R7_WORKER_AUTO_LOG_RUNTIME_RESULT_END

      const ok = runtimeResult && runtimeResult.result === "ok";

      if (!ok) {
        throw new Error(runtimeResult && (runtimeResult.error_message || runtimeResult.message || runtimeResult.error) ? (runtimeResult.error_message || runtimeResult.message || runtimeResult.error) : "runtime request failed");
      }

      const markResult = markWorkerUnitAutoExecutionStartedR8ZI(unitId, {
        result: runtimeResult.result,
        request_body: requestBody,
        runtime_request: runtimeResult.runtime_request || {},
        aiworker_response: runtimeResult.aiworker_response || {}
      });

      // AICM_V10L_C2G_B6R9R2_CLEAR_WAITING_ON_SUCCESS_START
      let aicmB6r9r2AcceptedMarkResult = null;
      try {
        aicmB6r9r2AcceptedMarkResult = markWorkerUnitAiworkerAcceptedMetadataB6R9R2(unitId, {
          runtime_request: runtimeResult.runtime_request || {},
          aiworker_response: runtimeResult.aiworker_response || {}
        });
      } catch (aicmB6r9r2AcceptedError) {
        aicmB6r9r2AcceptedMarkResult = {
          result: "error",
          error_message: aicmB6r9r2AcceptedError && aicmB6r9r2AcceptedError.message
            ? String(aicmB6r9r2AcceptedError.message)
            : String(aicmB6r9r2AcceptedError)
        };
      }
      // AICM_V10L_C2G_B6R9R2_CLEAR_WAITING_ON_SUCCESS_END

      const reviewResult = completeWorkerAutoExecutionAndCreateHumanReviewB6R7(unitId, {
        result: runtimeResult.result,
        request_body: requestBody,
        runtime_request: runtimeResult.runtime_request || {},
        aiworker_response: runtimeResult.aiworker_response || {}
      });

      executed.push({
        aicm_worker_work_unit_id: unitId,
        result: "ok",
        request_body: requestBody,
        runtime_result: runtimeResult,
        mark_result: markResult,
        review_result: reviewResult
      });
    } catch (error) {
      // AICM_V10L_C2G_B6R7_WORKER_AUTO_LOG_ERROR_START
      aicmB6r7Log("worker_auto_error", {
        aicm_worker_work_unit_id: unitId,
        error_message: error && error.message ? error.message : String(error)
      });
      // AICM_V10L_C2G_B6R7_WORKER_AUTO_LOG_ERROR_END
      const aicmB6r8r1ErrorMessage = error && error.message ? String(error.message) : String(error);
      let aicmB6r8r1WaitingMarked = false;
      let aicmB6r8r1WaitingMarkResult = null;

      // AICM_V10L_C2G_B6R8R1_AIWORKEROS_WAITING_METADATA_CATCH_START
      if (!dryRun && aicmIsAiworkerRuntimeUnavailableB6R8R1(aicmB6r8r1ErrorMessage)) {
        try {
          aicmB6r8r1WaitingMarkResult = markWorkerUnitAiworkerWaitingMetadataB6R8R1(unitId, {
            error_message: aicmB6r8r1ErrorMessage
          });

          if (aicmB6r8r1WaitingMarkResult && aicmB6r8r1WaitingMarkResult.result === "ok") {
            aicmB6r8r1WaitingMarked = true;
          }
        } catch (aicmB6r8r1WaitError) {
          aicmB6r8r1WaitingMarkResult = {
            result: "error",
            error_message: aicmB6r8r1WaitError && aicmB6r8r1WaitError.message ? String(aicmB6r8r1WaitError.message) : String(aicmB6r8r1WaitError)
          };
        }
      }
      // AICM_V10L_C2G_B6R8R1_AIWORKEROS_WAITING_METADATA_CATCH_END
      failed.push({
        aicm_worker_work_unit_id: unitId,
        result: aicmB6r8r1WaitingMarked ? "waiting" : "error",
        error_code: aicmB6r8r1WaitingMarked ? "AIWORKEROS_EXECUTION_WAITING" : "WORKER_AUTO_EXECUTION_ERROR",
        error_message: aicmB6r8r1ErrorMessage,
        waiting_mark_result: aicmB6r8r1WaitingMarkResult
      });
    }
  }

  // AICM_V10L_C2G_B6R7_WORKER_AUTO_LOG_RETURN_START
  aicmB6r7Log("return", {
    executed_count: executed.length,
    failed_count: failed.length,
    failed_ids: failed.map((row) => row && row.aicm_worker_work_unit_id || ""),
    failed_messages: failed.map((row) => row && row.error_message || "")
  });
  // AICM_V10L_C2G_B6R7_WORKER_AUTO_LOG_RETURN_END
  // AICM_V10L_C2G_B6R8R1_AIWORKEROS_WAITING_METADATA_RETURN_START
  const aicmB6r8r1Waiting = failed.filter(item => item && item.result === "waiting");
  const aicmB6r8r1NonWaitingFailed = failed.filter(item => !item || item.result !== "waiting");
  // AICM_V10L_C2G_B6R8R1_AIWORKEROS_WAITING_METADATA_RETURN_END

  return {
    result: aicmB6r8r1NonWaitingFailed.length ? "partial_error" : "ok",
    api_identifier: SERVER_MARK,
    dry_run: dryRun,
    candidate_count: pairs.length,
    executed_count: executed.length,
    failed_count: aicmB6r8r1NonWaitingFailed.length,
    waiting_count: aicmB6r8r1Waiting.length,
    raw_failed_count: failed.length,
    executed,
    waiting: aicmB6r8r1Waiting,
    failed
  };
}

// AICM_V10L_C2G_B6R31R1_AIWORKEROS_WAITING_AUTO_RETRY_HELPER_START
var aicmB6R31R1AiworkerosWaitingAutoRetryState = {
  started: false,
  running: false,
  timer: null,
  lastRunAt: "",
  lastResult: null
};

function aicmB6R31R1EnvText(name, fallback) {
  if (typeof process === "undefined" || !process || !process.env) return fallback;
  var value = process.env[name];
  if (value === null || typeof value === "undefined" || String(value).trim() === "") return fallback;
  return String(value).trim();
}

function aicmB6R31R1EnvBool(primaryName, fallback) {
  var raw = aicmB6R31R1EnvText(primaryName, "");
  if (!raw && primaryName !== "AICM_AIWORKEROS_AUTO_RETRY_ENABLED") {
    raw = aicmB6R31R1EnvText("AICM_AIWORKEROS_AUTO_RETRY_ENABLED", "");
  }

  if (!raw) return !!fallback;

  var text = String(raw).toLowerCase();
  if (text === "0" || text === "false" || text === "no" || text === "off" || text === "disabled") return false;
  if (text === "1" || text === "true" || text === "yes" || text === "on" || text === "enabled") return true;
  return !!fallback;
}

function aicmB6R31R1EnvInt(name, fallback, min, max) {
  var raw = aicmB6R31R1EnvText(name, "");
  var value = Number(raw || fallback);
  if (!Number.isFinite(value)) value = fallback;
  value = Math.floor(value);
  if (Number.isFinite(min) && value < min) value = min;
  if (Number.isFinite(max) && value > max) value = max;
  return value;
}

function aicmB6R31R1ServerMark() {
  return typeof SERVER_MARK !== "undefined" ? SERVER_MARK : "AICM_SERVER";
}

function aicmB6R31R1Log(phase, data) {
  try {
    console.info("AICM_B6R31R1_AIWORKEROS_WAITING_AUTO_RETRY " + JSON.stringify({
      phase: phase,
      at: new Date().toISOString(),
      data: data || {}
    }));
  } catch (_error) {}
}

async function aicmB6R31R1AiworkerosHealthOk() {
  var base = aicmB6R31R1EnvText("PERSONA_AIWORKEROS_BASE_URL", "http://127.0.0.1:8787").replace(/\/+$/, "");
  var timeoutMs = aicmB6R31R1EnvInt("AICM_AIWORKEROS_AUTO_RETRY_HEALTH_TIMEOUT_MS", 2500, 500, 15000);
  var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  var timeout = null;

  try {
    if (controller) {
      timeout = setTimeout(function () { controller.abort(); }, timeoutMs);
    }

    var response = await fetch(base + "/health", controller ? { signal: controller.signal } : undefined);
    return !!(response && response.ok);
  } catch (error) {
    aicmB6R31R1Log("health_unavailable", {
      error_message: error && error.message ? String(error.message) : String(error)
    });
    return false;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function aicmB6R31R1WaitingTargets(limit) {
  var safeLimit = Math.max(1, Math.min(Number(limit) || 5, 50));

  var sql = [
    "WITH worker AS (",
    "  SELECT",
    "    u.owner_civilization_id::text AS owner_civilization_id,",
    "    u.aicm_user_company_id::text AS aicm_user_company_id,",
    "    COALESCE(",
    "      NULLIF(to_jsonb(u)->>'aicm_manager_major_work_item_id', ''),",
    "      NULLIF(u.metadata_jsonb->>'source_manager_major_work_item_id', ''),",
    "      NULLIF(u.metadata_jsonb->>'related_manager_major_work_item_id', '')",
    "    ) AS manager_id_text,",
    "    max(u.updated_at) AS latest_updated_at,",
    "    count(*) AS worker_count",
    "  FROM business.aicm_worker_work_unit u",
    "  LEFT JOIN business.aicm_human_review_item h",
    "    ON h.related_worker_work_unit_id = u.aicm_worker_work_unit_id",
    "   AND COALESCE(h.human_review_status_code, '') <> 'archived'",
    "  WHERE h.aicm_human_review_item_id IS NULL",
    "    AND COALESCE(u.work_status_code, '') IN ('todo', 'in_progress')",
    "    AND COALESCE(u.review_status_code, '') IN ('required', 'waiting')",
    "    AND COALESCE(u.metadata_jsonb->>'aiworkeros_execution_state', '') = 'waiting'",
    "    AND lower(COALESCE(u.metadata_jsonb->>'aiworkeros_retryable', 'false')) IN ('true', 't', '1', 'yes')",
    "  GROUP BY",
    "    u.owner_civilization_id::text,",
    "    u.aicm_user_company_id::text,",
    "    COALESCE(",
    "      NULLIF(to_jsonb(u)->>'aicm_manager_major_work_item_id', ''),",
    "      NULLIF(u.metadata_jsonb->>'source_manager_major_work_item_id', ''),",
    "      NULLIF(u.metadata_jsonb->>'related_manager_major_work_item_id', '')",
    "    )",
    "),",
    "target AS (",
    "  SELECT *",
    "  FROM worker",
    "  WHERE manager_id_text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'",
    "  ORDER BY latest_updated_at ASC NULLS LAST",
    "  LIMIT " + String(safeLimit),
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(aicmB6R31R1ServerMark()) + ",",
    "  'target_count', count(*),",
    "  'targets', COALESCE(jsonb_agg(jsonb_build_object(",
    "    'owner_civilization_id', owner_civilization_id,",
    "    'aicm_user_company_id', aicm_user_company_id,",
    "    'aicm_manager_major_work_item_id', manager_id_text,",
    "    'worker_count', worker_count,",
    "    'latest_updated_at', latest_updated_at",
    "  ) ORDER BY latest_updated_at ASC NULLS LAST), '[]'::jsonb)",
    ")::text",
    "FROM target;"
  ].join("\n");

  return runPsqlJson(sql);
}

async function aicmB6R31R1AutoRetryWaitingOnce(reason) {
  var state = aicmB6R31R1AiworkerosWaitingAutoRetryState;

  if (!aicmB6R31R1EnvBool("AICM_AIWORKEROS_WAITING_AUTO_RETRY_ENABLED", true)) {
    aicmB6R31R1Log("disabled", { reason: reason || "manual" });
    return { result: "disabled", api_identifier: aicmB6R31R1ServerMark() };
  }

  if (state.running) {
    aicmB6R31R1Log("skip_running", { reason: reason || "manual" });
    return { result: "skipped", reason: "already_running", api_identifier: aicmB6R31R1ServerMark() };
  }

  state.running = true;
  state.lastRunAt = new Date().toISOString();

  try {
    var healthOk = await aicmB6R31R1AiworkerosHealthOk();
    if (!healthOk) {
      state.lastResult = { result: "waiting", reason: "aiworkeros_unavailable" };
      aicmB6R31R1Log("aiworkeros_unavailable", { reason: reason || "manual" });
      return state.lastResult;
    }

    var targetLimit = aicmB6R31R1EnvInt("AICM_AIWORKEROS_AUTO_RETRY_TARGET_LIMIT", 5, 1, 50);
    var unitLimit = aicmB6R31R1EnvInt("AICM_AIWORKEROS_AUTO_RETRY_UNIT_LIMIT", 10, 1, 50);
    var targetsResult = aicmB6R31R1WaitingTargets(targetLimit);
    var targets = targetsResult && Array.isArray(targetsResult.targets) ? targetsResult.targets : [];
    var executed = [];
    var failed = [];

    aicmB6R31R1Log("targets", {
      reason: reason || "manual",
      target_count: targets.length
    });

    for (var i = 0; i < targets.length; i += 1) {
      var target = targets[i] || {};
      var managerId = String(target.aicm_manager_major_work_item_id || "");
      var companyId = String(target.aicm_user_company_id || "");
      var ownerId = String(target.owner_civilization_id || "");

      try {
        var result = await runWorkerAutoExecutionR8ZI({
          owner_civilization_id: ownerId,
          aicm_user_company_id: companyId,
          aicm_manager_major_work_item_id: managerId,
          limit: unitLimit
        });

        executed.push({
          owner_civilization_id: ownerId,
          aicm_user_company_id: companyId,
          aicm_manager_major_work_item_id: managerId,
          result: result && result.result ? result.result : "unknown",
          executed_count: result && typeof result.executed_count !== "undefined" ? result.executed_count : null,
          waiting_count: result && typeof result.waiting_count !== "undefined" ? result.waiting_count : null,
          failed_count: result && typeof result.failed_count !== "undefined" ? result.failed_count : null
        });
      } catch (error) {
        failed.push({
          owner_civilization_id: ownerId,
          aicm_user_company_id: companyId,
          aicm_manager_major_work_item_id: managerId,
          error_message: error && error.message ? String(error.message) : String(error)
        });
      }
    }

    state.lastResult = {
      result: failed.length ? "partial_error" : "ok",
      api_identifier: aicmB6R31R1ServerMark(),
      reason: reason || "manual",
      target_count: targets.length,
      executed_count: executed.length,
      failed_count: failed.length,
      executed: executed,
      failed: failed
    };

    aicmB6R31R1Log("done", state.lastResult);
    return state.lastResult;
  } finally {
    state.running = false;
  }
}

function aicmB6R31R1StartAiworkerosWaitingAutoRetry() {
  var state = aicmB6R31R1AiworkerosWaitingAutoRetryState;
  if (state.started) return;
  state.started = true;

  if (!aicmB6R31R1EnvBool("AICM_AIWORKEROS_WAITING_AUTO_RETRY_ENABLED", true)) {
    aicmB6R31R1Log("boot_disabled", {});
    return;
  }

  var startDelayMs = aicmB6R31R1EnvInt("AICM_AIWORKEROS_AUTO_RETRY_START_DELAY_MS", 15000, 1000, 300000);
  var intervalMs = aicmB6R31R1EnvInt("AICM_AIWORKEROS_AUTO_RETRY_INTERVAL_MS", 60000, 10000, 3600000);

  aicmB6R31R1Log("boot", {
    start_delay_ms: startDelayMs,
    interval_ms: intervalMs
  });

  setTimeout(function () {
    aicmB6R31R1AutoRetryWaitingOnce("startup").catch(function (error) {
      aicmB6R31R1Log("startup_error", {
        error_message: error && error.message ? String(error.message) : String(error)
      });
    });
  }, startDelayMs);

  state.timer = setInterval(function () {
    aicmB6R31R1AutoRetryWaitingOnce("interval").catch(function (error) {
      aicmB6R31R1Log("interval_error", {
        error_message: error && error.message ? String(error.message) : String(error)
      });
    });
  }, intervalMs);
}
// AICM_V10L_C2G_B6R31R1_AIWORKEROS_WAITING_AUTO_RETRY_HELPER_END

// AICM_R8Z_I_WORKER_AUTO_EXECUTION_SERVER_END


async function handleApi(req, res, url) {
  const route = url.pathname;

  try {
    if (req.method === "OPTIONS") {
      sendJson(res, 200, { result: "ok", api_identifier: SERVER_MARK });
      return true;
    }

    
    if (route === "/api/aicm/v2/president-policy/create" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, createPresidentPolicy(body));
      return true;
    }

    if (route === "/api/aicm/v2/manager-major/create" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, createManagerMajorItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/manager-major/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateManagerMajorItem(body));
      return true;
    }

    
    if (route === "/api/aicm/v2/leader-auto-decomposition/run" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, runLeaderAutoDecomposition(body));
      return true;
    }
if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, archiveManagerMajorItem(body));
      return true;
    }

// AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1: repaired literal backslash-n near CSV import SQL assembly
    if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, importManagerMajorItemsCsv(body));
      return true;
    }


    if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, createHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, approveHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, returnHumanReviewItem(body));
      return true;
    }


    if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateCompany(body));
      return true;
    }

    if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateDepartment(body));
      return true;
    }

    // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
    // UI label "組織変更" is connected to the current section/k課 update responsibility.
    // Keep this as an explicit compatibility route so future split can be handled here.
    if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateSection(body));
      return true;
    }

    if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateSection(body));
      return true;
    }


    // AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE: review-list script transport for local browser hydration
    if (route === "/api/aicm/v2/context-script" && req.method === "GET") {
      const owner = url.searchParams.get("owner_civilization_id") || "";
      const callbackRaw = url.searchParams.get("callback") || "__aicmR8zV9ReviewContextCallback";
      const callback = /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(callbackRaw)
        ? callbackRaw
        : "__aicmR8zV9ReviewContextCallback";
      const payload = getContext(owner);
      const js = [
        "/* AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE */",
        "try {",
        callback + "(" + JSON.stringify(payload) + ");",
        "} catch (error) {",
        "  try { window.__aicmR8zV9ReviewContextError = String(error && error.message ? error.message : error); } catch (_) {}",
        "}"
      ].join("\n");

      res.writeHead(200, {
        "content-type": "application/javascript; charset=utf-8",
        "access-control-allow-origin": "*",
        "cache-control": "no-store"
      });
      res.end(js);
      return true;
    }

if (route === "/api/aicm/v2/context" && req.method === "GET") {
      sendJson(res, 200, aicmR8zV10gc4bFilterPendingReviewContext(getContext(url.searchParams.get("owner_civilization_id") || "")));
      return true;
    }

    if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
      sendJson(res, 200, createCompany(await readBody(req)));
      return true;
    }

    if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
      const payload = createDepartment(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

    if (route === "/api/aicm/v2/section/create" && req.method === "POST") {
      const payload = createSection(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

    
    if (route === "/api/aicm/v2/task-ledger/create" && req.method === "POST") {
      const payload = createTaskLedger(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

    if (route === "/api/aicm/v2/placement/sync-role-settings" && req.method === "POST") {
      const payload = syncRoleSettings(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

if (route === "/api/aicm/v2/placement/create" && req.method === "POST") {
      const payload = createPlacement(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

    // AICM_WORKER_RUNTIME_REQUEST_ROUTE_AXS_V1
    if (route === "/api/aicm/v2/worker-auto-execution/run" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, await runWorkerAutoExecutionR8ZI(body));
      return true;
    }
    if (route === "/api/aicm/v2/worker-runtime/request" && req.method === "POST") {
      const requestBody = await readBody(req);
      requestBody.source_app_ref = requestBody.source_app_ref || "AICompanyManager";
      requestBody.source_route_code = requestBody.source_route_code || "individual_instruction";
      requestBody.source_screen_code = requestBody.source_screen_code || "ai_execution_workbench";
      requestBody.source_entity_type = requestBody.source_entity_type || "runtime_request";
      requestBody.return_target_type = requestBody.return_target_type || "workbench_runtime_request";
      requestBody.reexecute_target_type = requestBody.reexecute_target_type || "runtime_request";
      requestBody.context_restore_type = requestBody.context_restore_type || "workbench";

      const payload = await createWorkerRuntimeRequest(requestBody);

      if (payload && payload.result === "ok" && requestBody.source_route_code === "individual_instruction") {
        payload.human_review_auto_registration = createIndividualRuntimeHumanReviewItemB6R44S(requestBody, payload);
      }

      // AICM_V10L_C2G_B6R44C_WORKBENCH_SOURCE_ROUTE_METADATA_START
      const aicmB6R44cRuntimeRequestSourceRouteMetadata = {
        source_app_ref: "AICompanyManager",
        source_route_code: "individual_instruction",
        source_screen_code: "ai_execution_workbench",
        source_entity_type: "runtime_request",
        source_entity_id: "",
        return_target_type: "workbench_runtime_request",
        reexecute_target_type: "runtime_request",
        context_restore_type: "workbench"
      };
      if (payload && typeof payload === "object") {
        payload.source_app_ref = payload.source_app_ref || aicmB6R44cRuntimeRequestSourceRouteMetadata.source_app_ref;
        payload.source_route_code = payload.source_route_code || aicmB6R44cRuntimeRequestSourceRouteMetadata.source_route_code;
        payload.source_screen_code = payload.source_screen_code || aicmB6R44cRuntimeRequestSourceRouteMetadata.source_screen_code;
        payload.source_entity_type = payload.source_entity_type || aicmB6R44cRuntimeRequestSourceRouteMetadata.source_entity_type;
        payload.return_target_type = payload.return_target_type || aicmB6R44cRuntimeRequestSourceRouteMetadata.return_target_type;
        payload.reexecute_target_type = payload.reexecute_target_type || aicmB6R44cRuntimeRequestSourceRouteMetadata.reexecute_target_type;
        payload.context_restore_type = payload.context_restore_type || aicmB6R44cRuntimeRequestSourceRouteMetadata.context_restore_type;
        payload.metadata_jsonb = Object.assign({}, payload.metadata_jsonb && typeof payload.metadata_jsonb === "object" ? payload.metadata_jsonb : {}, aicmB6R44cRuntimeRequestSourceRouteMetadata);
        payload.app_read_payload_jsonb = Object.assign({}, payload.app_read_payload_jsonb && typeof payload.app_read_payload_jsonb === "object" ? payload.app_read_payload_jsonb : {}, {
          source: aicmB6R44cRuntimeRequestSourceRouteMetadata
        });
      }
      // AICM_V10L_C2G_B6R44C_WORKBENCH_SOURCE_ROUTE_METADATA_END

      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

    
    // AICM_RUNTIME_STATUS_PANEL_AXT_R9_R1_V1
    if (route === "/api/aicm/v2/worker-runtime/pipeline-board" && req.method === "GET") {
      const payload = await aicmRuntimeStatusAiworkerGet("/aiworker/v1/runtime-execution/pipeline-board", url.searchParams);
      sendJson(res, payload && payload.result === "error" ? 502 : 200, payload);
      return true;
    }

    if (route === "/api/aicm/v2/worker-runtime/app-read-payload" && req.method === "GET") {
      const payload = await aicmRuntimeStatusAiworkerGet("/aiworker/v1/runtime-execution/app-read-payload", url.searchParams);
      sendJson(res, payload && payload.result === "error" ? 502 : 200, payload);
      return true;
    }

    if (route.startsWith("/api/aicm/v2/")) {
      sendJson(res, 404, {
        result: "error",
        api_identifier: SERVER_MARK,
        error_message: "unknown v2 endpoint"
      });
      return true;
    }

    return false;
  } catch (error) {
    sendJson(res, 500, {
      result: "error",
      api_identifier: SERVER_MARK,
      error_message: safePublicError(error)
    });
    return true;
  }
}

function safeStaticPath(urlPath) {
  const raw = urlPath === "/" ? "/index.html" : urlPath;
  const decoded = decodeURIComponent(raw);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.resolve(APP_ROOT, "." + normalized);

  if (!full.startsWith(APP_ROOT)) {
    return null;
  }

  return full;
}

function serveStatic(req, res, url) {
  const filePath = safeStaticPath(url.pathname);

  if (!filePath) {
    sendText(res, 403, "text/plain; charset=utf-8", "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(res, 404, "text/plain; charset=utf-8", "Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    sendText(res, 200, MIME[ext] || "application/octet-stream", data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");

  if (await handleApi(req, res, url)) {
    return;
  }

  serveStatic(req, res, url);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:" + PORT);
});


// AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_CONTEXT_FILTER_START
// Review wait context must expose pending items only.
// This is a presentation/context filter; it does not modify DB state.
function aicmR8zV10gc4bIsReviewWaitRow(row) {
  return !!(row && typeof row === "object" && (
    Object.prototype.hasOwnProperty.call(row, "aicm_human_review_item_id") ||
    Object.prototype.hasOwnProperty.call(row, "human_review_status_code") ||
    Object.prototype.hasOwnProperty.call(row, "review_kind_code") ||
    Object.prototype.hasOwnProperty.call(row, "artifact_kind_code")
  ));
}

function aicmR8zV10gc4bReviewStatus(row) {
  return String(
    row && (
      row.human_review_status_code ||
      row.review_status ||
      row.status_code ||
      row.status ||
      ""
    ) || ""
  ).trim();
}

function aicmR8zV10gc4bFilterReviewWaitArray(rows) {
  if (!Array.isArray(rows)) return rows;

  var hasReviewRows = rows.some(aicmR8zV10gc4bIsReviewWaitRow);
  if (!hasReviewRows) return rows;

  return rows.filter(function(row) {
    return aicmR8zV10gc4bReviewStatus(row) === "pending";
  });
}

function aicmR8zV10gc4bFilterPendingReviewContext(value) {
  if (!value || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return aicmR8zV10gc4bFilterReviewWaitArray(value).map(aicmR8zV10gc4bFilterPendingReviewContext);
  }

  Object.keys(value).forEach(function(key) {
    var child = value[key];

    if (Array.isArray(child)) {
      value[key] = aicmR8zV10gc4bFilterReviewWaitArray(child).map(aicmR8zV10gc4bFilterPendingReviewContext);
    } else if (child && typeof child === "object") {
      value[key] = aicmR8zV10gc4bFilterPendingReviewContext(child);
    }
  });

  return value;
}
// AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_CONTEXT_FILTER_END


// AICM_V10L_C2G_B6R31R1_AIWORKEROS_WAITING_AUTO_RETRY_BOOT_START
setTimeout(function () {
  try {
    if (typeof aicmB6R31R1StartAiworkerosWaitingAutoRetry === "function") {
      aicmB6R31R1StartAiworkerosWaitingAutoRetry();
    }
  } catch (error) {
    try {
      console.error("AICM_B6R31R1_AIWORKEROS_WAITING_AUTO_RETRY_BOOT_ERROR", error && error.message ? error.message : error);
    } catch (_error) {}
  }
}, 0);
// AICM_V10L_C2G_B6R31R1_AIWORKEROS_WAITING_AUTO_RETRY_BOOT_END
