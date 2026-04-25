-- ============================================================
-- STREAM STUDIO PHASE1 VERIFY SQL
-- Reviewer: Sato (DB)
-- ============================================================

SELECT 'creator_project' AS table_name, count(*) AS row_count
FROM streaming.creator_project
UNION ALL
SELECT 'creator_upload_job', count(*) FROM streaming.creator_upload_job
UNION ALL
SELECT 'creator_video_draft', count(*) FROM streaming.creator_video_draft
UNION ALL
SELECT 'creator_publish_setting', count(*) FROM streaming.creator_publish_setting
UNION ALL
SELECT 'creator_publish_request', count(*) FROM streaming.creator_publish_request
UNION ALL
SELECT 'creator_runtime_job', count(*) FROM streaming.creator_runtime_job
UNION ALL
SELECT 'creator_dead_letter_entry', count(*) FROM streaming.creator_dead_letter_entry
UNION ALL
SELECT 'creator_audit_event', count(*) FROM streaming.creator_audit_event
ORDER BY table_name;
