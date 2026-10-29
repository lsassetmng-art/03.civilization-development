-- ISOLATED CI DATABASE ONLY
-- Never execute against a production database.

\set ON_ERROR_STOP on

SELECT current_database() = 'r20_replay_ci'
  AS is_expected_database
\gset

\if :is_expected_database
\else
  \echo STOP_WRONG_DATABASE
  \quit 1
\endif

-- Guard against accidental use outside the disposable CI DB.
DO $$
BEGIN
  IF current_database() <> 'r20_replay_ci'
     OR current_user <> 'postgres'
  THEN
    RAISE EXCEPTION 'R20_CI_BOOTSTRAP_TARGET_REJECTED';
  END IF;
END;
$$;

CREATE SCHEMA civilization;

CREATE ROLE r20_replay_runtime LOGIN PASSWORD 'r20-ci-only-password';

-- The migration transfers ownership of a function and table.
-- These permissions are confined to the disposable CI database.
CREATE ROLE r20_persona_handoff_owner
  NOLOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;

GRANT r20_persona_handoff_owner TO CURRENT_USER;

GRANT USAGE, CREATE
  ON SCHEMA civilization
  TO r20_persona_handoff_owner;

GRANT USAGE
  ON SCHEMA civilization
  TO r20_replay_runtime;
