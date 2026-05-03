# Next plan

## Review target

佐藤(DB担当) should review:
- owner_civilization_id as ownership root
- table naming
- foreign key strategy
- status codes
- placement role codes
- event/audit table sufficiency
- selected_flag handling

## After approval

Next phase applies only:
- CREATE TABLE IF NOT EXISTS
- CREATE INDEX IF NOT EXISTS
- CREATE OR REPLACE VIEW

No data migration yet.
No API save yet.
No delete.
No RLS apply unless separately approved.
