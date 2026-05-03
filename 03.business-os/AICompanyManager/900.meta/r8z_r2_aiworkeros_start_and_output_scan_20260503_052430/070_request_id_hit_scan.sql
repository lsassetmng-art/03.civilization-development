\pset format aligned
\pset null '(null)'

CREATE TEMP TABLE r8z_r2_request_id_hits (
  table_schema text,
  table_name text,
  column_name text,
  data_type text,
  hit_count bigint
) ON COMMIT DROP;

DO $$
DECLARE
  c record;
  n bigint;
  q text;
  id1 text := '1c2fceb2-4f1a-4dd4-8cc7-63d7d529e6aa';
  id2 text := '569fc089-2771-4616-9c3b-0a93698b203a';
BEGIN
  FOR c IN
    SELECT
      table_schema,
      table_name,
      column_name,
      data_type
    FROM information_schema.columns
    WHERE table_schema IN ('aiworker', 'business', 'cx22073jw')
      AND (
        data_type IN ('text', 'uuid', 'jsonb', 'json', 'character varying')
        OR udt_name = 'uuid'
      )
      AND (
        table_name ILIKE '%runtime%'
        OR table_name ILIKE '%execution%'
        OR table_name ILIKE '%request%'
        OR table_name ILIKE '%pipeline%'
        OR table_name ILIKE '%output%'
        OR table_name ILIKE '%delivery%'
        OR table_name ILIKE '%result%'
        OR table_name ILIKE '%work%'
        OR column_name ILIKE '%request%'
        OR column_name ILIKE '%runtime%'
        OR column_name ILIKE '%payload%'
        OR column_name ILIKE '%metadata%'
      )
  LOOP
    q := format(
      'SELECT count(*) FROM %I.%I WHERE %I::text = %L OR %I::text = %L OR %I::text LIKE %L OR %I::text LIKE %L',
      c.table_schema,
      c.table_name,
      c.column_name,
      id1,
      c.column_name,
      id2,
      c.column_name,
      '%' || id1 || '%',
      c.column_name,
      '%' || id2 || '%'
    );

    BEGIN
      EXECUTE q INTO n;
      IF n > 0 THEN
        INSERT INTO r8z_r2_request_id_hits
        VALUES (c.table_schema, c.table_name, c.column_name, c.data_type, n);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END
$$;

SELECT
  'request_id_hits' AS section,
  table_schema,
  table_name,
  column_name,
  data_type,
  hit_count
FROM r8z_r2_request_id_hits
ORDER BY hit_count DESC, table_schema, table_name, column_name;
