import fs from "node:fs";

const file = process.argv[2];
if (!file) throw new Error("SQL file required");

let text = fs.readFileSync(file, "utf8");

const startMarker = "CREATE OR REPLACE VIEW cx22073jw.vw_brain_full_load_coverage_v1 AS";
const endMarker = "\n\nCOMMIT;";

const start = text.lastIndexOf(startMarker);
if (start < 0) throw new Error("coverage view start not found");

const end = text.indexOf(endMarker, start);
if (end < 0) throw new Error("COMMIT marker after coverage view not found");

const replacement = `CREATE OR REPLACE VIEW cx22073jw.vw_brain_full_load_coverage_v1 AS
WITH unit_counts AS (
  SELECT
    brain_domain_code,
    count(*) FILTER (WHERE active_flag = true) AS active_unit_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack02_%') AS pack02_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack03_%') AS pack03_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack04_%') AS pack04_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack05_%') AS pack05_count
  FROM cx22073jw.brain_knowledge_unit
  GROUP BY brain_domain_code
),
registry_counts AS (
  SELECT
    brain_domain_code,
    count(*) AS registry_count,
    count(*) FILTER (WHERE brain_data_code LIKE 'srcobj:%') AS source_object_registry_count,
    count(*) FILTER (WHERE brain_data_code LIKE 'srcrow:%') AS source_row_registry_count,
    count(*) FILTER (WHERE source_exists_flag = true) AS source_exists_count,
    count(*) FILTER (WHERE source_exists_flag = false) AS source_missing_count
  FROM cx22073jw.vw_brain_data_registry_v1
  GROUP BY brain_domain_code
),
readable_counts AS (
  SELECT
    brain_domain_code,
    count(DISTINCT model_code) AS readable_model_count,
    count(*) AS readable_material_row_count
  FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
  GROUP BY brain_domain_code
)
SELECT
  s.brain_domain_code,
  dc.brain_domain_label_ja,
  s.full_load_priority,
  s.target_min_unit_count,
  COALESCE(u.active_unit_count, 0) AS active_unit_count,
  COALESCE(u.pack02_count, 0) AS pack02_count,
  COALESCE(u.pack03_count, 0) AS pack03_count,
  COALESCE(u.pack04_count, 0) AS pack04_count,
  COALESCE(u.pack05_count, 0) AS pack05_count,
  COALESCE(r.registry_count, 0) AS registry_count,
  COALESCE(r.source_exists_count, 0) AS source_exists_count,
  COALESCE(r.source_missing_count, 0) AS source_missing_count,
  COALESCE(rc.readable_model_count, 0) AS readable_model_count,
  COALESCE(rc.readable_material_row_count, 0) AS readable_material_row_count,
  CASE
    WHEN COALESCE(u.active_unit_count, 0) >= s.target_min_unit_count
     AND COALESCE(r.source_missing_count, 0) = 0
    THEN 'loaded'
    WHEN COALESCE(u.active_unit_count, 0) > 0
     AND COALESCE(r.source_missing_count, 0) = 0
    THEN 'partial_loaded'
    ELSE 'needs_load'
  END AS full_load_status,
  s.full_load_note_ja,
  COALESCE(r.source_object_registry_count, 0) AS source_object_registry_count,
  COALESCE(r.source_row_registry_count, 0) AS source_row_registry_count
FROM cx22073jw.brain_full_load_scope_catalog s
JOIN cx22073jw.brain_data_domain_catalog dc
  ON dc.brain_domain_code = s.brain_domain_code
LEFT JOIN unit_counts u
  ON u.brain_domain_code = s.brain_domain_code
LEFT JOIN registry_counts r
  ON r.brain_domain_code = s.brain_domain_code
LEFT JOIN readable_counts rc
  ON rc.brain_domain_code = s.brain_domain_code
WHERE s.active_flag = true;`;

text = text.slice(0, start) + replacement + text.slice(end);

fs.writeFileSync(file, text, "utf8");

console.log("PATCH_OK coverage view compatible column order");
console.log(`PATCHED_FILE=${file}`);
