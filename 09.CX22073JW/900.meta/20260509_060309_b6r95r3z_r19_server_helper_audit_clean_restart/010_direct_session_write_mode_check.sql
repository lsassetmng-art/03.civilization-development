\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned

SELECT 'transaction_read_only=' || current_setting('transaction_read_only');
SELECT 'default_transaction_read_only=' || current_setting('default_transaction_read_only');
SELECT 'current_database=' || current_database();
SELECT 'current_user=' || current_user;
SELECT 'pg_is_in_recovery=' || pg_is_in_recovery()::text;

BEGIN;
SELECT 'inside_plain_begin_transaction_read_only=' || current_setting('transaction_read_only');
ROLLBACK;

SELECT 'note=No INSERT/UPDATE/DELETE executed.';
