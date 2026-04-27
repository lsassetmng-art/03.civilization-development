"use strict";

/**
 * AICompanyManager organization persistent write smoke server.
 *
 * Phase JY-KB:
 * - localhost POST smoke only
 * - validates parent company exists
 * - validates parent department exists
 * - inserts one persistent smoke row into business.aicm_organization
 * - validates inserted row exists
 * - no RLS apply
 * - no schema change
 * - no ledger persistent write
 * - no review action
 * - no CSV import
 * - no workflow start
 * - no AIWorkerOS call
 */

const http = require("http");
const { spawnSync } = require("child_process");

const PORT = Number(process.env.AICM_ORGANIZATION_PERSISTENT_WRITE_PORT || "18784");
const DATABASE_URL_VALUE = process.env.PERSONA_DATABASE_URL || "";
const PARENT_COMPANY_ID = process.env.AICM_PARENT_COMPANY_ID || "";
const PARENT_DEPARTMENT_ID = process.env.AICM_PARENT_DEPARTMENT_ID || "";

function buildSql(parentCompanyId, parentDepartmentId) {
  return `
CREATE TEMP TABLE tmp_aicm_organization_persistent_smoke_result (
  company_id_text text NOT NULL,
  department_id_text text NOT NULL,
  organization_id_text text NOT NULL,
  inserted_rows integer NOT NULL
) ON COMMIT PRESERVE ROWS;

DO $$
DECLARE
  v_company_id_text text := '${parentCompanyId}';
  v_department_id_text text := '${parentDepartmentId}';
  v_organization_id_text text := '00000000-0000-4000-8000-' || substr(md5('organization_persistent' || clock_timestamp()::text), 1, 12);
  v_cols text := NULL;
  v_vals text := NULL;
  v_value text := NULL;
  v_sql text := NULL;
  v_rows integer := 0;
  r record;
  v_enum_value text;
  v_required boolean;
BEGIN
  IF to_regclass('business.aicm_company') IS NULL THEN
    RAISE EXCEPTION 'required table not found: business.aicm_company';
  END IF;

  IF to_regclass('business.aicm_department') IS NULL THEN
    RAISE EXCEPTION 'required table not found: business.aicm_department';
  END IF;

  IF to_regclass('business.aicm_organization') IS NULL THEN
    RAISE EXCEPTION 'required table not found: business.aicm_organization';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM business.aicm_company c
    WHERE c.company_id::text = v_company_id_text
  ) THEN
    RAISE EXCEPTION 'parent company not found for organization persistent smoke: %', v_company_id_text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM business.aicm_department d
    WHERE d.department_id::text = v_department_id_text
      AND d.company_id::text = v_company_id_text
  ) THEN
    RAISE EXCEPTION 'parent department not found for organization persistent smoke: department=%, company=%', v_department_id_text, v_company_id_text;
  END IF;

  FOR r IN
    SELECT
      c.column_name,
      c.data_type,
      c.udt_schema,
      c.udt_name,
      c.is_nullable,
      c.column_default,
      c.is_identity,
      c.is_generated
    FROM information_schema.columns c
    WHERE c.table_schema = 'business'
      AND c.table_name = 'aicm_organization'
    ORDER BY c.ordinal_position
  LOOP
    IF r.is_identity = 'YES' THEN
      CONTINUE;
    END IF;

    IF COALESCE(r.is_generated, 'NEVER') <> 'NEVER' THEN
      CONTINUE;
    END IF;

    v_required :=
      (r.is_nullable = 'NO' AND r.column_default IS NULL)
      OR r.column_name IN (
        'organization_id',
        'company_id',
        'department_id',
        'organization_name',
        'purpose',
        'organization_status',
        'display_order'
      );

    IF NOT v_required THEN
      CONTINUE;
    END IF;

    v_value := NULL;

    IF r.column_name = 'organization_id' THEN
      IF r.data_type = 'uuid' THEN
        v_value := quote_literal(v_organization_id_text) || '::uuid';
      ELSE
        v_value := quote_literal(v_organization_id_text);
      END IF;

    ELSIF r.column_name = 'company_id' THEN
      IF r.data_type = 'uuid' THEN
        v_value := quote_literal(v_company_id_text) || '::uuid';
      ELSE
        v_value := quote_literal(v_company_id_text);
      END IF;

    ELSIF r.column_name = 'department_id' THEN
      IF r.data_type = 'uuid' THEN
        v_value := quote_literal(v_department_id_text) || '::uuid';
      ELSE
        v_value := quote_literal(v_department_id_text);
      END IF;

    ELSIF r.column_name = 'parent_organization_id' THEN
      v_value := 'NULL';

    ELSIF r.column_name IN ('organization_name', 'name') THEN
      v_value := quote_literal('AICM Persistent Smoke Organization ' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS'));

    ELSIF r.column_name IN ('purpose', 'description') THEN
      v_value := quote_literal('persistent write smoke row created by Phase JY-KB; do not use as production organization');

    ELSIF r.column_name IN ('organization_status', 'status') THEN
      IF r.data_type = 'USER-DEFINED' THEN
        SELECT e.enumlabel
          INTO v_enum_value
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE n.nspname = r.udt_schema
          AND t.typname = r.udt_name
        ORDER BY e.enumsortorder
        LIMIT 1;

        IF v_enum_value IS NULL THEN
          v_value := quote_literal('active');
        ELSE
          v_value := quote_literal(v_enum_value) || '::' || quote_ident(r.udt_schema) || '.' || quote_ident(r.udt_name);
        END IF;
      ELSE
        v_value := quote_literal('active');
      END IF;

    ELSIF r.column_name = 'display_order' THEN
      v_value := '0';

    ELSIF r.column_name = 'robot_assignments' THEN
      IF r.data_type = 'jsonb' THEN
        v_value := quote_literal('[]') || '::jsonb';
      ELSIF r.data_type = 'json' THEN
        v_value := quote_literal('[]') || '::json';
      ELSE
        v_value := quote_literal('[]');
      END IF;

    ELSIF r.data_type = 'uuid' THEN
      v_value := quote_literal('00000000-0000-4000-8000-' || substr(md5(r.column_name || clock_timestamp()::text), 1, 12)) || '::uuid';

    ELSIF r.data_type IN ('text', 'character varying', 'character') THEN
      v_value := quote_literal('aicm_organization_persistent_write_smoke');

    ELSIF r.data_type IN ('integer', 'bigint', 'smallint') THEN
      v_value := '0';

    ELSIF r.data_type IN ('numeric', 'real', 'double precision') THEN
      v_value := '0';

    ELSIF r.data_type = 'boolean' THEN
      v_value := 'false';

    ELSIF r.data_type = 'date' THEN
      v_value := 'current_date';

    ELSIF r.data_type LIKE 'timestamp%' THEN
      v_value := 'now()';

    ELSIF r.data_type = 'jsonb' THEN
      v_value := quote_literal('{}') || '::jsonb';

    ELSIF r.data_type = 'json' THEN
      v_value := quote_literal('{}') || '::json';

    ELSIF r.data_type = 'USER-DEFINED' THEN
      SELECT e.enumlabel
        INTO v_enum_value
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE n.nspname = r.udt_schema
        AND t.typname = r.udt_name
      ORDER BY e.enumsortorder
      LIMIT 1;

      IF v_enum_value IS NOT NULL THEN
        v_value := quote_literal(v_enum_value) || '::' || quote_ident(r.udt_schema) || '.' || quote_ident(r.udt_name);
      END IF;
    END IF;

    IF v_value IS NULL THEN
      RAISE EXCEPTION 'unsupported required organization column % type=% udt=%.%',
        r.column_name,
        r.data_type,
        r.udt_schema,
        r.udt_name;
    END IF;

    v_cols := concat_ws(', ', v_cols, quote_ident(r.column_name));
    v_vals := concat_ws(', ', v_vals, v_value);
  END LOOP;

  IF v_cols IS NULL OR v_vals IS NULL THEN
    RAISE EXCEPTION 'no insertable columns resolved for business.aicm_organization';
  END IF;

  v_sql := 'INSERT INTO business.aicm_organization (' || v_cols || ') VALUES (' || v_vals || ')';
  EXECUTE v_sql;
  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows <> 1 THEN
    RAISE EXCEPTION 'organization persistent write smoke expected 1 row, got %', v_rows;
  END IF;

  INSERT INTO tmp_aicm_organization_persistent_smoke_result(company_id_text, department_id_text, organization_id_text, inserted_rows)
  VALUES (v_company_id_text, v_department_id_text, v_organization_id_text, v_rows);
END $$;

SELECT json_build_object(
  'ok', true,
  'target', 'business.aicm_organization',
  'parentTargets', json_build_array('business.aicm_company', 'business.aicm_department'),
  'endpoint', '/api/aicm/v1/organizations/persistent-write-smoke',
  'company_id', r.company_id_text,
  'department_id', r.department_id_text,
  'organization_id', r.organization_id_text,
  'insertedRows', r.inserted_rows,
  'dbWriteExecuted', true,
  'persistentDbWrite', true,
  'companyPersistentWrite', false,
  'departmentPersistentWrite', false,
  'organizationPersistentWrite', true,
  'persistedRowExists', EXISTS (
    SELECT 1
    FROM business.aicm_organization o
    WHERE o.organization_id::text = r.organization_id_text
      AND o.department_id::text = r.department_id_text
      AND o.company_id::text = r.company_id_text
  ),
  'ledgerPersistentWrite', false,
  'reviewAction', false,
  'csvImport', false,
  'workflowStart', false,
  'liveAiworkerosCall', false,
  'request_id', 'phase_jy_kb_organization_persistent_write_smoke'
)::text
FROM tmp_aicm_organization_persistent_smoke_result r;
`;
}

function runOrganizationPersistentWriteSmoke() {
  if (!DATABASE_URL_VALUE) {
    return {
      statusCode: 500,
      body: {
        ok: false,
        error_code: "PERSONA_DATABASE_URL_MISSING",
        error_message: "PERSONA_DATABASE_URL is required for organization persistent write smoke.",
        details: {},
        request_id: "phase_jy_kb_env_missing"
      }
    };
  }

  if (!PARENT_COMPANY_ID || !PARENT_DEPARTMENT_ID) {
    return {
      statusCode: 500,
      body: {
        ok: false,
        error_code: "AICM_PARENT_IDS_MISSING",
        error_message: "AICM_PARENT_COMPANY_ID and AICM_PARENT_DEPARTMENT_ID are required.",
        details: {
          parentCompanyIdPresent: Boolean(PARENT_COMPANY_ID),
          parentDepartmentIdPresent: Boolean(PARENT_DEPARTMENT_ID)
        },
        request_id: "phase_jy_kb_parent_missing"
      }
    };
  }

  const result = spawnSync(
    "psql",
    ["-X", "-qAt", "-v", "ON_ERROR_STOP=1", DATABASE_URL_VALUE],
    {
      input: buildSql(PARENT_COMPANY_ID, PARENT_DEPARTMENT_ID),
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 20
    }
  );

  if (result.status !== 0) {
    return {
      statusCode: 500,
      body: {
        ok: false,
        error_code: "ORGANIZATION_PERSISTENT_WRITE_SMOKE_FAILED",
        error_message: "Organization persistent write smoke failed.",
        details: {
          stderr: result.stderr || "",
          stdout: result.stdout || ""
        },
        request_id: "phase_jy_kb_organization_persistent_write_failed"
      }
    };
  }

  const lines = String(result.stdout || "").trim().split(/\r?\n/).filter(Boolean);
  const lastLine = lines[lines.length - 1] || "";

  let parsed;
  try {
    parsed = JSON.parse(lastLine);
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        ok: false,
        error_code: "ORGANIZATION_PERSISTENT_WRITE_RESPONSE_PARSE_FAILED",
        error_message: "Could not parse psql JSON response.",
        details: {
          stdout: result.stdout || "",
          stderr: result.stderr || "",
          parseError: String(error && error.message ? error.message : error)
        },
        request_id: "phase_jy_kb_parse_failed"
      }
    };
  }

  if (!parsed.persistedRowExists) {
    return {
      statusCode: 500,
      body: {
        ok: false,
        error_code: "ORGANIZATION_PERSISTENT_WRITE_NOT_FOUND_AFTER_INSERT",
        error_message: "Inserted organization row was not found after persistent write.",
        details: parsed,
        request_id: "phase_jy_kb_persist_validation_failed"
      }
    };
  }

  return {
    statusCode: 200,
    body: {
      ok: true,
      data: parsed,
      warnings: [
        "persistent_smoke_organization_row_created",
        "organization_scope_only",
        "next_scope_separated"
      ],
      request_id: "phase_jy_kb_organization_persistent_write_smoke"
    }
  };
}

const server = http.createServer((req, res) => {
  const path = req.url.split("?")[0];

  if (req.method !== "POST" || path !== "/api/aicm/v1/organizations/persistent-write-smoke") {
    res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: false,
      error_code: "NOT_FOUND",
      error_message: "Endpoint not found.",
      details: {
        method: req.method,
        url: req.url
      },
      request_id: "phase_jy_kb_not_found"
    }));
    return;
  }

  req.on("data", () => {});
  req.on("end", () => {
    const result = runOrganizationPersistentWriteSmoke();

    res.writeHead(result.statusCode, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(result.body, null, 2));
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("AICM_ORGANIZATION_PERSISTENT_WRITE_SERVER_READY port=" + PORT);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
