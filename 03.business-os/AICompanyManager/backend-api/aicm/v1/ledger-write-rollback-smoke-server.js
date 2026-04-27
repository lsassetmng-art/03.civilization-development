"use strict";

/**
 * AICompanyManager ledger write rollback smoke server.
 *
 * Phase IS-IV:
 * - localhost POST smoke only
 * - company, department, and ledger rows are inserted inside one transaction
 * - transaction always rolls back
 * - no persistent DB write
 * - no review action
 * - no CSV import
 * - no workflow start
 * - no AIWorkerOS call
 */

const http = require("http");
const { spawnSync } = require("child_process");

const PORT = Number(process.env.AICM_LEDGER_WRITE_ROLLBACK_PORT || "18769");
const DATABASE_URL_VALUE = process.env.PERSONA_DATABASE_URL || "";

const SQL = `
BEGIN;

DO $$
DECLARE
  v_company_id_text text := '00000000-0000-4000-8000-' || substr(md5('company' || clock_timestamp()::text), 1, 12);
  v_department_id_text text := '00000000-0000-4000-8000-' || substr(md5('department' || clock_timestamp()::text), 1, 12);
  v_ledger_row_id_text text := '00000000-0000-4000-8000-' || substr(md5('ledger' || clock_timestamp()::text), 1, 12);

  v_cols text;
  v_vals text;
  v_value text;
  v_sql text;
  v_rows integer;
  v_enum_value text;
  v_required boolean;
  r record;
BEGIN
  IF to_regclass('business.aicm_company') IS NULL THEN
    RAISE EXCEPTION 'required table not found: business.aicm_company';
  END IF;

  IF to_regclass('business.aicm_department') IS NULL THEN
    RAISE EXCEPTION 'required table not found: business.aicm_department';
  END IF;

  IF to_regclass('business.aicm_department_task_ledger') IS NULL THEN
    RAISE EXCEPTION 'required table not found: business.aicm_department_task_ledger';
  END IF;

  v_cols := NULL;
  v_vals := NULL;

  FOR r IN
    SELECT c.column_name, c.data_type, c.udt_schema, c.udt_name, c.is_nullable, c.column_default, c.is_identity, c.is_generated
    FROM information_schema.columns c
    WHERE c.table_schema = 'business'
      AND c.table_name = 'aicm_company'
    ORDER BY c.ordinal_position
  LOOP
    IF r.is_identity = 'YES' OR COALESCE(r.is_generated, 'NEVER') <> 'NEVER' THEN
      CONTINUE;
    END IF;

    v_required :=
      (r.is_nullable = 'NO' AND r.column_default IS NULL)
      OR r.column_name IN ('company_id', 'company_name', 'business_domain', 'company_status', 'company_common_rules_text');

    IF NOT v_required THEN
      CONTINUE;
    END IF;

    v_value := NULL;

    IF r.column_name = 'company_id' THEN
      IF r.data_type = 'uuid' THEN
        v_value := quote_literal(v_company_id_text) || '::uuid';
      ELSE
        v_value := quote_literal(v_company_id_text);
      END IF;

    ELSIF r.column_name IN ('company_name', 'name') THEN
      v_value := quote_literal('AICM Ledger Smoke Support Company');

    ELSIF r.column_name IN ('business_domain', 'domain') THEN
      v_value := quote_literal('ledger_write_rollback_smoke');

    ELSIF r.column_name IN ('company_common_rules_text', 'common_rules', 'rules_text') THEN
      v_value := quote_literal('ledger write rollback smoke support only');

    ELSIF r.column_name IN ('company_status', 'status') THEN
      IF r.data_type = 'USER-DEFINED' THEN
        SELECT e.enumlabel INTO v_enum_value
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

    ELSIF r.data_type = 'uuid' THEN
      v_value := quote_literal('00000000-0000-4000-8000-' || substr(md5(r.column_name || clock_timestamp()::text), 1, 12)) || '::uuid';
    ELSIF r.data_type IN ('text', 'character varying', 'character') THEN
      v_value := quote_literal('aicm_ledger_smoke_support');
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
      SELECT e.enumlabel INTO v_enum_value
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
      RAISE EXCEPTION 'unsupported required company column % type=% udt=%.%', r.column_name, r.data_type, r.udt_schema, r.udt_name;
    END IF;

    v_cols := concat_ws(', ', v_cols, quote_ident(r.column_name));
    v_vals := concat_ws(', ', v_vals, v_value);
  END LOOP;

  v_sql := 'INSERT INTO business.aicm_company (' || v_cols || ') VALUES (' || v_vals || ')';
  EXECUTE v_sql;

  v_cols := NULL;
  v_vals := NULL;

  FOR r IN
    SELECT c.column_name, c.data_type, c.udt_schema, c.udt_name, c.is_nullable, c.column_default, c.is_identity, c.is_generated
    FROM information_schema.columns c
    WHERE c.table_schema = 'business'
      AND c.table_name = 'aicm_department'
    ORDER BY c.ordinal_position
  LOOP
    IF r.is_identity = 'YES' OR COALESCE(r.is_generated, 'NEVER') <> 'NEVER' THEN
      CONTINUE;
    END IF;

    v_required :=
      (r.is_nullable = 'NO' AND r.column_default IS NULL)
      OR r.column_name IN ('department_id', 'company_id', 'department_name', 'purpose', 'department_status', 'display_order');

    IF NOT v_required THEN
      CONTINUE;
    END IF;

    v_value := NULL;

    IF r.column_name = 'department_id' THEN
      IF r.data_type = 'uuid' THEN
        v_value := quote_literal(v_department_id_text) || '::uuid';
      ELSE
        v_value := quote_literal(v_department_id_text);
      END IF;

    ELSIF r.column_name = 'company_id' THEN
      IF r.data_type = 'uuid' THEN
        v_value := quote_literal(v_company_id_text) || '::uuid';
      ELSE
        v_value := quote_literal(v_company_id_text);
      END IF;

    ELSIF r.column_name IN ('department_name', 'name') THEN
      v_value := quote_literal('AICM Ledger Smoke Support Department');

    ELSIF r.column_name IN ('purpose', 'description') THEN
      v_value := quote_literal('ledger write rollback smoke support only');

    ELSIF r.column_name IN ('department_status', 'status') THEN
      IF r.data_type = 'USER-DEFINED' THEN
        SELECT e.enumlabel INTO v_enum_value
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
    ELSIF r.data_type = 'uuid' THEN
      v_value := quote_literal('00000000-0000-4000-8000-' || substr(md5(r.column_name || clock_timestamp()::text), 1, 12)) || '::uuid';
    ELSIF r.data_type IN ('text', 'character varying', 'character') THEN
      v_value := quote_literal('aicm_ledger_smoke_support_department');
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
      SELECT e.enumlabel INTO v_enum_value
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
      RAISE EXCEPTION 'unsupported required department column % type=% udt=%.%', r.column_name, r.data_type, r.udt_schema, r.udt_name;
    END IF;

    v_cols := concat_ws(', ', v_cols, quote_ident(r.column_name));
    v_vals := concat_ws(', ', v_vals, v_value);
  END LOOP;

  v_sql := 'INSERT INTO business.aicm_department (' || v_cols || ') VALUES (' || v_vals || ')';
  EXECUTE v_sql;

  v_cols := NULL;
  v_vals := NULL;

  FOR r IN
    SELECT c.column_name, c.data_type, c.udt_schema, c.udt_name, c.is_nullable, c.column_default, c.is_identity, c.is_generated
    FROM information_schema.columns c
    WHERE c.table_schema = 'business'
      AND c.table_name = 'aicm_department_task_ledger'
    ORDER BY c.ordinal_position
  LOOP
    IF r.is_identity = 'YES' OR COALESCE(r.is_generated, 'NEVER') <> 'NEVER' THEN
      CONTINUE;
    END IF;

    v_required :=
      (r.is_nullable = 'NO' AND r.column_default IS NULL)
      OR r.column_name IN (
        'ledger_row_id',
        'company_id',
        'department_id',
        'deliverable_name',
        'task_name',
        'work_type',
        'task_status',
        'priority',
        'due_date',
        'responsible_role',
        'responsible_robot_id',
        'reference_files',
        'supplemental_materials',
        'applicable_rules',
        'handoff_link',
        'note'
      );

    IF NOT v_required THEN
      CONTINUE;
    END IF;

    v_value := NULL;

    IF r.column_name = 'ledger_row_id' THEN
      IF r.data_type = 'uuid' THEN
        v_value := quote_literal(v_ledger_row_id_text) || '::uuid';
      ELSE
        v_value := quote_literal(v_ledger_row_id_text);
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

    ELSIF r.column_name = 'deliverable_name' THEN
      v_value := quote_literal('AICM Ledger Write Rollback Smoke Deliverable');

    ELSIF r.column_name = 'task_name' THEN
      v_value := quote_literal('AICM Ledger Write Rollback Smoke Task');

    ELSIF r.column_name = 'work_type' THEN
      IF r.data_type = 'USER-DEFINED' THEN
        SELECT e.enumlabel INTO v_enum_value
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE n.nspname = r.udt_schema
          AND t.typname = r.udt_name
        ORDER BY e.enumsortorder
        LIMIT 1;
        IF v_enum_value IS NULL THEN
          v_value := quote_literal('設計');
        ELSE
          v_value := quote_literal(v_enum_value) || '::' || quote_ident(r.udt_schema) || '.' || quote_ident(r.udt_name);
        END IF;
      ELSE
        v_value := quote_literal('設計');
      END IF;

    ELSIF r.column_name IN ('task_status', 'status') THEN
      IF r.data_type = 'USER-DEFINED' THEN
        SELECT e.enumlabel INTO v_enum_value
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE n.nspname = r.udt_schema
          AND t.typname = r.udt_name
        ORDER BY e.enumsortorder
        LIMIT 1;
        IF v_enum_value IS NULL THEN
          v_value := quote_literal('未着手');
        ELSE
          v_value := quote_literal(v_enum_value) || '::' || quote_ident(r.udt_schema) || '.' || quote_ident(r.udt_name);
        END IF;
      ELSE
        v_value := quote_literal('未着手');
      END IF;

    ELSIF r.column_name = 'priority' THEN
      IF r.data_type IN ('integer', 'bigint', 'smallint') THEN
        v_value := '0';
      ELSE
        v_value := quote_literal('高');
      END IF;

    ELSIF r.column_name = 'due_date' THEN
      v_value := 'current_date';

    ELSIF r.column_name = 'responsible_role' THEN
      v_value := quote_literal('Manager');

    ELSIF r.column_name = 'responsible_robot_id' THEN
      IF r.data_type = 'uuid' THEN
        v_value := 'NULL';
      ELSE
        v_value := quote_literal('');
      END IF;

    ELSIF r.column_name IN ('reference_files', 'supplemental_materials', 'applicable_rules') THEN
      IF r.data_type = 'jsonb' THEN
        v_value := quote_literal('[]') || '::jsonb';
      ELSIF r.data_type = 'json' THEN
        v_value := quote_literal('[]') || '::json';
      ELSE
        v_value := quote_literal('');
      END IF;

    ELSIF r.column_name = 'handoff_link' THEN
      v_value := quote_literal('rollback-smoke-only');

    ELSIF r.column_name = 'note' THEN
      v_value := quote_literal('ledger write rollback smoke only; transaction must rollback');

    ELSIF r.data_type = 'uuid' THEN
      v_value := quote_literal('00000000-0000-4000-8000-' || substr(md5(r.column_name || clock_timestamp()::text), 1, 12)) || '::uuid';
    ELSIF r.data_type IN ('text', 'character varying', 'character') THEN
      v_value := quote_literal('aicm_ledger_write_rollback_smoke');
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
      SELECT e.enumlabel INTO v_enum_value
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
      RAISE EXCEPTION 'unsupported required ledger column % type=% udt=%.%', r.column_name, r.data_type, r.udt_schema, r.udt_name;
    END IF;

    v_cols := concat_ws(', ', v_cols, quote_ident(r.column_name));
    v_vals := concat_ws(', ', v_vals, v_value);
  END LOOP;

  IF v_cols IS NULL OR v_vals IS NULL THEN
    RAISE EXCEPTION 'no insertable columns resolved for business.aicm_department_task_ledger';
  END IF;

  v_sql := 'INSERT INTO business.aicm_department_task_ledger (' || v_cols || ') VALUES (' || v_vals || ')';
  EXECUTE v_sql;
  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows <> 1 THEN
    RAISE EXCEPTION 'ledger write rollback smoke expected 1 row, got %', v_rows;
  END IF;
END $$;

ROLLBACK;
`;

function runLedgerWriteRollbackSmoke() {
  if (!DATABASE_URL_VALUE) {
    return {
      statusCode: 500,
      body: {
        ok: false,
        error_code: "PERSONA_DATABASE_URL_MISSING",
        error_message: "PERSONA_DATABASE_URL is required for ledger write rollback smoke.",
        details: {},
        request_id: "phase_is_iv_env_missing"
      }
    };
  }

  const result = spawnSync(
    "psql",
    ["-X", "-qAt", "-v", "ON_ERROR_STOP=1", DATABASE_URL_VALUE],
    {
      input: SQL,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 20
    }
  );

  if (result.status !== 0) {
    return {
      statusCode: 500,
      body: {
        ok: false,
        error_code: "LEDGER_WRITE_ROLLBACK_SMOKE_FAILED",
        error_message: "Ledger write rollback smoke failed.",
        details: {
          stderr: result.stderr || "",
          stdout: result.stdout || ""
        },
        request_id: "phase_is_iv_write_rollback_failed"
      }
    };
  }

  return {
    statusCode: 200,
    body: {
      ok: true,
      data: {
        target: "business.aicm_department_task_ledger",
        supportTargets: [
          "business.aicm_company",
          "business.aicm_department"
        ],
        endpoint: "/api/aicm/v1/ledger/write-rollback-smoke",
        transaction: "ROLLBACK",
        dbWriteExecuted: true,
        persistentDbWrite: false,
        companySupportRowRollbackOnly: true,
        departmentSupportRowRollbackOnly: true,
        ledgerWrite: true,
        reviewAction: false,
        csvImport: false,
        workflowStart: false,
        liveAiworkerosCall: false
      },
      warnings: [
        "ledger_write_rollback_smoke_only",
        "support_rows_rollback_only",
        "no_persistent_db_write",
        "next_scope_separated"
      ],
      request_id: "phase_is_iv_ledger_write_rollback_smoke"
    }
  };
}

const server = http.createServer((req, res) => {
  const path = req.url.split("?")[0];

  if (req.method !== "POST" || path !== "/api/aicm/v1/ledger/write-rollback-smoke") {
    res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: false,
      error_code: "NOT_FOUND",
      error_message: "Endpoint not found.",
      details: {
        method: req.method,
        url: req.url
      },
      request_id: "phase_is_iv_not_found"
    }));
    return;
  }

  req.on("data", () => {});
  req.on("end", () => {
    const result = runLedgerWriteRollbackSmoke();

    res.writeHead(result.statusCode, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(result.body, null, 2));
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("AICM_LEDGER_WRITE_ROLLBACK_SERVER_READY port=" + PORT);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
