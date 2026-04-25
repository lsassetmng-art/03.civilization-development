#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== SOURCE SUMMARY ==='
TABLE cx22073jw.v_candidate_area_source_summary;

\echo '=== PRIORITY MATRIX ==='
SELECT source_system, source_app, area_name, priority_code, is_phase1_recommended
FROM cx22073jw.v_candidate_area_priority_matrix
ORDER BY source_system, source_app, priority_code, area_name;

\echo '=== STREAMWATCH HIGHEST PRIORITY ==='
SELECT area_name, area_roles, phase_recommendation
FROM cx22073jw.v_candidate_area_priority_matrix
WHERE source_system = 'StreamingOS'
  AND source_app = 'StreamWatch'
  AND priority_code = 'highest'
ORDER BY area_name;

\echo '=== STATICART HIGH PRIORITY ==='
SELECT area_name, priority_code, phase_recommendation
FROM cx22073jw.v_candidate_area_priority_matrix
WHERE source_system = 'StaticArtOS'
  AND priority_code = 'high'
ORDER BY area_name;

\echo '=== STREAMSTUDIO HIGH PRIORITY ==='
SELECT area_name, priority_code, phase_recommendation
FROM cx22073jw.v_candidate_area_priority_matrix
WHERE source_app = 'StreamStudio'
  AND priority_code = 'high'
ORDER BY area_name;

\echo '=== TAG COUNTS ==='
SELECT tag_code, COUNT(*) AS cnt
FROM cx22073jw.candidate_area_tag
GROUP BY tag_code
ORDER BY tag_code;

\echo '=== STREAMWATCH BOUNDARY COUNT ==='
SELECT boundary_group, COUNT(*) AS cnt
FROM cx22073jw.candidate_area_boundary_rule br
JOIN cx22073jw.candidate_ledger_source_registry sr
  ON sr.ledger_source_id = br.ledger_source_id
WHERE sr.source_code = 'streamwatch_candidate_ledger'
GROUP BY boundary_group
ORDER BY boundary_group;
SQL
