#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
BATCH_CODE="access_db_role_provision_${RUN_TS}"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_db_role_provisioning.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS DB ROLE PROVISIONING START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "batch_code   : $BATCH_CODE"
  echo "started_at   : $RUN_TS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_role_access_bundle_master'
  ) THEN
    RAISE EXCEPTION 'access_role_access_bundle_master is required before db role provisioning';
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'foundation_domain_master'
  ) THEN
    INSERT INTO cx22073jw.foundation_domain_master (
      domain_code, domain_name, layer_code, domain_family, description
    ) VALUES (
      'access_db_role_provisioning',
      'AI Employee DB Role Provisioning',
      'normal',
      'integration',
      'Provision expected database roles for AI employee access control'
    )
    ON CONFLICT (domain_code) DO UPDATE
    SET domain_name   = EXCLUDED.domain_name,
        layer_code    = EXCLUDED.layer_code,
        domain_family = EXCLUDED.domain_family,
        description   = EXCLUDED.description,
        updated_at    = NOW();
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS cx22073jw.access_db_role_registry (
  db_role_registry_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code                      text NOT NULL UNIQUE,
  domain_code                    text NOT NULL,
  expected_db_role_name          text NOT NULL UNIQUE,
  role_kind                      text NOT NULL CHECK (role_kind IN ('group_role')),
  role_status                    text NOT NULL CHECK (role_status IN ('planned','provisioned','retired')),
  login_allowed                  boolean NOT NULL DEFAULT false,
  inherit_flag                   boolean NOT NULL DEFAULT true,
  superuser_flag                 boolean NOT NULL DEFAULT false,
  createrole_flag                boolean NOT NULL DEFAULT false,
  createdb_flag                  boolean NOT NULL DEFAULT false,
  replication_flag               boolean NOT NULL DEFAULT false,
  bypassrls_flag                 boolean NOT NULL DEFAULT false,
  note_text                      text,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  updated_at                     timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_db_role_provision_batch (
  db_role_provision_batch_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code                     text NOT NULL UNIQUE,
  requested_role_count           integer NOT NULL DEFAULT 0,
  created_role_count             integer NOT NULL DEFAULT 0,
  existing_role_count            integer NOT NULL DEFAULT 0,
  failed_role_count              integer NOT NULL DEFAULT 0,
  batch_status                   text NOT NULL CHECK (batch_status IN ('running','pass','partial','error')),
  actor_name                     text NOT NULL DEFAULT 'Zero',
  note_text                      text,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  updated_at                     timestamptz NOT NULL DEFAULT NOW(),
  ended_at                       timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_db_role_provision_item (
  db_role_provision_item_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  db_role_provision_batch_id     uuid NOT NULL REFERENCES cx22073jw.access_db_role_provision_batch(db_role_provision_batch_id) ON DELETE CASCADE,
  role_code                      text NOT NULL,
  domain_code                    text NOT NULL,
  expected_db_role_name          text NOT NULL,
  provision_status               text NOT NULL CHECK (provision_status IN ('created','already_exists','failed')),
  error_text                     text,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (db_role_provision_batch_id, expected_db_role_name)
);

CREATE INDEX IF NOT EXISTS ix_access_db_role_registry_domain
  ON cx22073jw.access_db_role_registry (domain_code, role_status);

CREATE INDEX IF NOT EXISTS ix_access_db_role_provision_batch_created
  ON cx22073jw.access_db_role_provision_batch (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_db_role_provision_item_batch
  ON cx22073jw.access_db_role_provision_item (db_role_provision_batch_id, provision_status, domain_code);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'cx22073jw'
      AND p.proname = 'fn_set_updated_at'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_db_role_registry_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_db_role_registry'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_db_role_registry_updated_at
        BEFORE UPDATE ON cx22073jw.access_db_role_registry
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_db_role_provision_batch_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_db_role_provision_batch'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_db_role_provision_batch_updated_at
        BEFORE UPDATE ON cx22073jw.access_db_role_provision_batch
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

INSERT INTO cx22073jw.access_db_role_registry (
  role_code,
  domain_code,
  expected_db_role_name,
  role_kind,
  role_status,
  login_allowed,
  inherit_flag,
  superuser_flag,
  createrole_flag,
  createdb_flag,
  replication_flag,
  bypassrls_flag,
  note_text
)
SELECT
  bm.role_code,
  bm.domain_code,
  'aiemp_role__' || bm.role_code,
  'group_role',
  'planned',
  false,
  true,
  false,
  false,
  false,
  false,
  false,
  'Group-style role for AI employee access bundle upper-bound mapping.'
FROM cx22073jw.access_role_access_bundle_master bm
ON CONFLICT (role_code) DO UPDATE
SET domain_code           = EXCLUDED.domain_code,
    expected_db_role_name = EXCLUDED.expected_db_role_name,
    role_kind             = EXCLUDED.role_kind,
    login_allowed         = EXCLUDED.login_allowed,
    inherit_flag          = EXCLUDED.inherit_flag,
    superuser_flag        = EXCLUDED.superuser_flag,
    createrole_flag       = EXCLUDED.createrole_flag,
    createdb_flag         = EXCLUDED.createdb_flag,
    replication_flag      = EXCLUDED.replication_flag,
    bypassrls_flag        = EXCLUDED.bypassrls_flag,
    note_text             = EXCLUDED.note_text,
    updated_at            = NOW();

CREATE OR REPLACE FUNCTION cx22073jw.fn_provision_access_db_roles(
  p_batch_code text,
  p_actor_name text DEFAULT 'Zero'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch_id uuid;
  v_requested integer := 0;
  v_created integer := 0;
  v_existing integer := 0;
  v_failed integer := 0;
  r record;
BEGIN
  INSERT INTO cx22073jw.access_db_role_provision_batch (
    batch_code,
    batch_status,
    actor_name,
    note_text
  )
  VALUES (
    p_batch_code,
    'running',
    p_actor_name,
    'Provisioning expected aiemp_role__* roles as NOLOGIN group roles.'
  )
  RETURNING db_role_provision_batch_id INTO v_batch_id;

  FOR r IN
    SELECT
      reg.role_code,
      reg.domain_code,
      reg.expected_db_role_name
    FROM cx22073jw.access_db_role_registry reg
    WHERE reg.role_status IN ('planned','provisioned')
    ORDER BY reg.domain_code, reg.role_code
  LOOP
    v_requested := v_requested + 1;

    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = r.expected_db_role_name
      ) THEN
        v_existing := v_existing + 1;

        INSERT INTO cx22073jw.access_db_role_provision_item (
          db_role_provision_batch_id,
          role_code,
          domain_code,
          expected_db_role_name,
          provision_status,
          error_text
        )
        VALUES (
          v_batch_id,
          r.role_code,
          r.domain_code,
          r.expected_db_role_name,
          'already_exists',
          NULL
        );
      ELSE
        EXECUTE format(
          'CREATE ROLE %I NOLOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION',
          r.expected_db_role_name
        );

        v_created := v_created + 1;

        INSERT INTO cx22073jw.access_db_role_provision_item (
          db_role_provision_batch_id,
          role_code,
          domain_code,
          expected_db_role_name,
          provision_status,
          error_text
        )
        VALUES (
          v_batch_id,
          r.role_code,
          r.domain_code,
          r.expected_db_role_name,
          'created',
          NULL
        );
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        v_failed := v_failed + 1;

        INSERT INTO cx22073jw.access_db_role_provision_item (
          db_role_provision_batch_id,
          role_code,
          domain_code,
          expected_db_role_name,
          provision_status,
          error_text
        )
        VALUES (
          v_batch_id,
          r.role_code,
          r.domain_code,
          r.expected_db_role_name,
          'failed',
          SQLERRM
        );
    END;
  END LOOP;

  UPDATE cx22073jw.access_db_role_registry reg
     SET role_status = 'provisioned',
         updated_at  = NOW()
   WHERE EXISTS (
     SELECT 1
     FROM pg_roles pr
     WHERE pr.rolname = reg.expected_db_role_name
   );

  UPDATE cx22073jw.access_db_role_provision_batch
     SET requested_role_count = v_requested,
         created_role_count   = v_created,
         existing_role_count  = v_existing,
         failed_role_count    = v_failed,
         batch_status         = CASE
                                  WHEN v_requested = 0 THEN 'error'
                                  WHEN v_failed = 0 THEN 'pass'
                                  WHEN v_created > 0 OR v_existing > 0 THEN 'partial'
                                  ELSE 'error'
                                END,
         ended_at             = NOW(),
         updated_at           = NOW()
   WHERE db_role_provision_batch_id = v_batch_id;

  RETURN v_batch_id;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_db_role_registry_summary AS
SELECT
  reg.role_code,
  reg.domain_code,
  reg.expected_db_role_name,
  reg.role_status,
  EXISTS (
    SELECT 1
    FROM pg_roles pr
    WHERE pr.rolname = reg.expected_db_role_name
  ) AS role_exists_flag,
  reg.login_allowed,
  reg.inherit_flag,
  reg.superuser_flag,
  reg.createrole_flag,
  reg.createdb_flag,
  reg.replication_flag,
  reg.bypassrls_flag
FROM cx22073jw.access_db_role_registry reg
ORDER BY reg.domain_code, reg.role_code;

CREATE OR REPLACE VIEW cx22073jw.v_access_db_role_provision_latest_batch_summary AS
SELECT
  batch_code,
  requested_role_count,
  created_role_count,
  existing_role_count,
  failed_role_count,
  batch_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_db_role_provision_batch
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_db_role_provision_latest_items AS
SELECT
  b.batch_code,
  i.role_code,
  i.domain_code,
  i.expected_db_role_name,
  i.provision_status,
  i.error_text,
  i.created_at
FROM cx22073jw.access_db_role_provision_item i
JOIN cx22073jw.access_db_role_provision_batch b
  ON b.db_role_provision_batch_id = i.db_role_provision_batch_id
WHERE b.db_role_provision_batch_id = (
  SELECT db_role_provision_batch_id
  FROM cx22073jw.access_db_role_provision_batch
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.domain_code, i.role_code;

COMMIT;
SQL

  echo "============================================================"
  echo "PHASE 2: RUN PROVISION"
  echo "============================================================"

  PROVISION_BATCH_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT cx22073jw.fn_provision_access_db_roles(
  '$BATCH_CODE',
  'Zero'
);
SQL
  )"

  if [ -z "${PROVISION_BATCH_ID:-}" ]; then
    echo "ERROR: db role provision batch was not created"
    exit 1
  fi

  echo "PROVISION_BATCH_ID=$PROVISION_BATCH_ID"

  echo "============================================================"
  echo "PHASE 3: VERIFY"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_db_role_provision_latest_batch_summary;

SELECT
  domain_code,
  provision_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_db_role_provision_latest_items
GROUP BY domain_code, provision_status
ORDER BY domain_code, provision_status;

SELECT
  role_code,
  domain_code,
  expected_db_role_name,
  role_status,
  role_exists_flag
FROM cx22073jw.v_access_db_role_registry_summary
ORDER BY domain_code, role_code;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS DB ROLE PROVISIONING DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
