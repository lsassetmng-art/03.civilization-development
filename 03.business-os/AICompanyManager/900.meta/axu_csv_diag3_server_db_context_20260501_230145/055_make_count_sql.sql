select
  'select ' ||
  quote_literal(n.nspname || '.' || c.relname) ||
  ' as object_name, count(*)::text as row_count from ' ||
  quote_ident(n.nspname) || '.' || quote_ident(c.relname) ||
  ' union all'
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'business'
  and c.relkind in ('r','v','m')
  and (
    c.relname ilike '%major%'
    or c.relname ilike '%pmlw%'
    or c.relname ilike '%ledger%'
    or c.relname ilike '%task%'
  )
order by c.relname;
