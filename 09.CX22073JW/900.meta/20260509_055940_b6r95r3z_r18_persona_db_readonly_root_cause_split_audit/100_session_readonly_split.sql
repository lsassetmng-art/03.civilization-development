\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned

SELECT 'transaction_read_only=' || current_setting('transaction_read_only');
SELECT 'default_transaction_read_only=' || current_setting('default_transaction_read_only');
SELECT 'session_replication_role=' || current_setting('session_replication_role');
SELECT 'current_database=' || current_database();
SELECT 'current_user=' || current_user;
SELECT 'server_addr=' || coalesce(inet_server_addr()::text, 'unknown');
SELECT 'server_port=' || coalesce(inet_server_port()::text, 'unknown');
SELECT 'pg_is_in_recovery=' || pg_is_in_recovery()::text;

SELECT 'database_datconfig=' || coalesce(array_to_string(datconfig, ','), '')
FROM pg_database
WHERE datname = current_database();

SELECT 'role_rolconfig=' || coalesce(array_to_string(rolconfig, ','), '')
FROM pg_roles
WHERE rolname = current_user;

SELECT 'db_role_setting=' || coalesce(string_agg(coalesce(s, ''), ' | '), '')
FROM (
  SELECT unnest(setconfig) AS s
  FROM pg_db_role_setting drs
  LEFT JOIN pg_database d ON d.oid = drs.setdatabase
  LEFT JOIN pg_roles r ON r.oid = drs.setrole
  WHERE (d.datname = current_database() OR drs.setdatabase = 0)
    AND (r.rolname = current_user OR drs.setrole = 0)
) q;

BEGIN;
SELECT 'inside_plain_begin_transaction_read_only=' || current_setting('transaction_read_only');
SELECT 'inside_plain_begin_default_transaction_read_only=' || current_setting('default_transaction_read_only');
ROLLBACK;
