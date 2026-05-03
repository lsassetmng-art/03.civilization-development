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
  const text = String(value || "").trim();
  return /^\\d{4}-\\d{2}-\\d{2}$/.test(text) ? sqlLiteral(text) + "::date" : "NULL";
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
  ].join("")).join(",\\n    ");

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

    if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, archiveManagerMajorItem(body));
      return true;
    }

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

if (route === "/api/aicm/v2/context" && req.method === "GET") {
      sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
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

if (route === "/api/aicm/v2/placement/create" && req.method === "POST") {
      const payload = createPlacement(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
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
