\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned

SELECT 'before_force_transaction_read_only=' || current_setting('transaction_read_only');
SELECT 'before_force_default_transaction_read_only=' || current_setting('default_transaction_read_only');

SET default_transaction_read_only = off;

SELECT 'after_set_default_transaction_read_only=' || current_setting('default_transaction_read_only');

BEGIN;
SELECT 'inside_force_off_begin_transaction_read_only=' || current_setting('transaction_read_only');
SELECT 'inside_force_off_begin_default_transaction_read_only=' || current_setting('default_transaction_read_only');
ROLLBACK;

SELECT 'note=No INSERT/UPDATE/DELETE executed.';
