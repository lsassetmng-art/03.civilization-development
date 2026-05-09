\set ON_ERROR_STOP on

SELECT
  '01_session_default_without_set' AS section,
  current_setting('transaction_read_only') AS transaction_read_only,
  current_setting('default_transaction_read_only') AS default_transaction_read_only,
  current_setting('session_replication_role') AS session_replication_role,
  current_database() AS database_name,
  current_user AS db_user,
  inet_server_addr()::text AS server_addr,
  inet_server_port() AS server_port,
  pg_is_in_recovery() AS pg_is_in_recovery;

BEGIN;
SELECT
  '02_inside_plain_begin_without_set' AS section,
  current_setting('transaction_read_only') AS transaction_read_only,
  current_setting('default_transaction_read_only') AS default_transaction_read_only;
ROLLBACK;

SELECT
  '03_runtime_create_function_can_be_called_only_in_write_session' AS section,
  'No function call executed here. This audit only checks session defaults.' AS note;
