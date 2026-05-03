============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 成果物レビューの承認/差し戻し

現在位置:
- V10Gはpatch前で停止
- core/serverにはV10G partial patchなし
- 停止原因:
  business.aicm_human_review_wait_view が存在しない

今回:
1. business schemaのreview系relationを一覧化
2. review系columnsを一覧化
3. business.aicm_human_review_queue が実在するか確認
4. queue実体に対して pending -> approved -> returned をROLLBACK内だけで検証
5. 永続更新はしない
6. 次のV10G-Cで、実在relationに合わせてAPI/UI接続へ進む

禁止:
- persistent DB write
- API POST
- file patch

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb_review_relation_corrected_rollback_smoke_20260503_230138
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO
DB_REVIEW=佐藤(DB担当)

============================================================
2. review relation inventory
============================================================
schema_name	relation_name	relkind	relation_type
business	ai_company_manager_approval	r	table
business	ai_company_manager_approval_pkey	i	i
business	ai_company_manager_review	r	table
business	ai_company_manager_review_pkey	i	i
business	aicm_human_review_item	r	table
business	aicm_human_review_item_pkey	i	i
business	aicm_review_action	r	table
business	aicm_review_action_pkey	i	i
business	aicm_review_item	r	table
business	aicm_review_item_pkey	i	i
business	approval_action	r	table
business	approval_action_pkey	i	i
business	approval_flow_definition	r	table
business	approval_flow_definition_pkey	i	i
business	approval_flow_step_definition	r	table
business	approval_flow_step_definition_pkey	i	i
business	approval_request	r	table
business	approval_request_pkey	i	i
business	approval_step_instance	r	table
business	approval_step_instance_pkey	i	i
business	idx_aicm_approval_deliverable_id	i	i
business	idx_aicm_approval_project_id	i	i
business	idx_aicm_approval_run_id	i	i
business	idx_aicm_approval_status	i	i
business	idx_aicm_delivery_approval_id	i	i
business	idx_aicm_human_review_department_section	i	i
business	idx_aicm_human_review_owner_company_status	i	i
business	idx_aicm_human_review_related_work_unit	i	i
business	idx_aicm_return_review_id	i	i
business	idx_aicm_review_deliverable_id	i	i
business	idx_aicm_review_item_company_department	i	i
business	idx_aicm_review_run_id	i	i
business	idx_aicm_review_status	i	i
business	idx_approval_request_ref	i	i
business	idx_approval_request_status	i	i
business	idx_step_waiting_due	i	i
business	uq_aicm_review_action_idempotency	i	i
business	ux_approval_request_pending_unique	i	i
business	vw_aicm_human_review_wait_display	v	view
(39 rows)

============================================================
3. review column inventory
============================================================
table_schema	table_name	ordinal_position	column_name	data_type	is_nullable
business	ai_company_manager_approval	1	approval_id	uuid	NO
business	ai_company_manager_approval	2	project_id	uuid	NO
business	ai_company_manager_approval	3	pipeline_run_id	uuid	NO
business	ai_company_manager_approval	4	deliverable_id	uuid	NO
business	ai_company_manager_approval	5	approver_user_id	uuid	NO
business	ai_company_manager_approval	6	approval_status	text	NO
business	ai_company_manager_approval	7	approval_comment	text	YES
business	ai_company_manager_approval	8	approved_at	timestamp with time zone	YES
business	ai_company_manager_approval	9	created_at	timestamp with time zone	NO
business	ai_company_manager_approval	10	updated_at	timestamp with time zone	NO
business	ai_company_manager_review	1	review_id	uuid	NO
business	ai_company_manager_review	2	deliverable_id	uuid	NO
business	ai_company_manager_review	3	pipeline_run_id	uuid	NO
business	ai_company_manager_review	4	reviewer_role	text	NO
business	ai_company_manager_review	5	reviewer_ref	text	YES
business	ai_company_manager_review	6	review_status	text	NO
business	ai_company_manager_review	7	review_comment	text	YES
business	ai_company_manager_review	8	quality_score	integer	YES
business	ai_company_manager_review	9	reviewed_at	timestamp with time zone	YES
business	ai_company_manager_review	10	created_at	timestamp with time zone	NO
business	ai_company_manager_review	11	updated_at	timestamp with time zone	NO
business	aicm_human_review_item	1	aicm_human_review_item_id	uuid	NO
business	aicm_human_review_item	2	owner_civilization_id	uuid	NO
business	aicm_human_review_item	3	aicm_user_company_id	uuid	NO
business	aicm_human_review_item	4	aicm_user_company_department_id	uuid	YES
business	aicm_human_review_item	5	aicm_user_company_section_id	uuid	YES
business	aicm_human_review_item	6	related_president_policy_id	uuid	YES
business	aicm_human_review_item	7	related_manager_major_work_item_id	uuid	YES
business	aicm_human_review_item	8	related_leader_middle_work_item_id	uuid	YES
business	aicm_human_review_item	9	related_deliverable_requirement_id	uuid	YES
business	aicm_human_review_item	10	related_worker_work_unit_id	uuid	YES
business	aicm_human_review_item	11	review_kind_code	text	NO
business	aicm_human_review_item	12	artifact_kind_code	text	NO
business	aicm_human_review_item	13	review_title	text	NO
business	aicm_human_review_item	14	delivery_summary_text	text	NO
business	aicm_human_review_item	15	main_changes_text	text	NO
business	aicm_human_review_item	16	ai_review_result_text	text	NO
business	aicm_human_review_item	17	unresolved_issues_text	text	NO
business	aicm_human_review_item	18	artifact_link	text	NO
business	aicm_human_review_item	19	responsible_ai_label	text	NO
business	aicm_human_review_item	20	requested_by_ai_label	text	NO
business	aicm_human_review_item	21	human_review_status_code	text	NO
business	aicm_human_review_item	22	priority_code	text	NO
business	aicm_human_review_item	23	due_date	date	YES
business	aicm_human_review_item	24	human_reviewer_label	text	NO
business	aicm_human_review_item	25	human_review_note	text	NO
business	aicm_human_review_item	26	requested_at	timestamp with time zone	NO
business	aicm_human_review_item	27	reviewed_at	timestamp with time zone	YES
business	aicm_human_review_item	28	display_order	integer	NO
business	aicm_human_review_item	29	metadata_jsonb	jsonb	NO
business	aicm_human_review_item	30	created_at	timestamp with time zone	NO
business	aicm_human_review_item	31	updated_at	timestamp with time zone	NO
business	aicm_review_action	1	review_action_id	uuid	NO
business	aicm_review_action	2	review_item_id	uuid	NO
business	aicm_review_action	3	company_id	uuid	NO
business	aicm_review_action	4	action_type	text	NO
business	aicm_review_action	5	action_status_after	text	NO
business	aicm_review_action	6	actor_user_id	uuid	YES
business	aicm_review_action	7	actor_role	text	NO
business	aicm_review_action	8	idempotency_key	text	YES
business	aicm_review_action	9	comment	text	NO
business	aicm_review_action	10	created_at	timestamp with time zone	NO
business	aicm_review_item	1	review_item_id	uuid	NO
business	aicm_review_item	2	company_id	uuid	NO
business	aicm_review_item	3	department_id	uuid	YES
business	aicm_review_item	4	ledger_row_id	uuid	YES
business	aicm_review_item	5	review_title	text	NO
business	aicm_review_item	6	target_name	text	NO
business	aicm_review_item	7	review_status	text	NO
business	aicm_review_item	8	note	text	NO
business	aicm_review_item	9	created_at	timestamp with time zone	NO
business	aicm_review_item	10	updated_at	timestamp with time zone	NO
business	approval_action	1	action_id	uuid	NO
business	approval_action	2	request_id	uuid	NO
business	approval_action	3	step_order	integer	YES
business	approval_action	4	actor_id	uuid	YES
business	approval_action	5	action	USER-DEFINED	NO
business	approval_action	6	comment	text	YES
business	approval_action	7	meta	jsonb	NO
business	approval_action	8	acted_at	timestamp with time zone	NO
business	approval_flow_definition	1	flow_code	text	NO
business	approval_flow_definition	2	description	text	YES
business	approval_flow_definition	3	is_active	boolean	NO
business	approval_flow_definition	4	created_at	timestamp with time zone	NO
business	approval_flow_step_definition	1	flow_code	text	NO
business	approval_flow_step_definition	2	step_order	integer	NO
business	approval_flow_step_definition	3	role_code	text	NO
business	approval_flow_step_definition	4	sla_hours	integer	NO
business	approval_flow_step_definition	5	is_required	boolean	NO
business	approval_flow_step_definition	6	created_at	timestamp with time zone	NO
business	approval_request	1	request_id	uuid	NO
business	approval_request	2	request_type	USER-DEFINED	NO
business	approval_request	3	flow_code	text	NO
business	approval_request	4	reference_schema	text	NO
business	approval_request	5	reference_table	text	NO
business	approval_request	6	reference_id	uuid	NO
business	approval_request	7	payload	jsonb	NO
business	approval_request	8	status	USER-DEFINED	NO
business	approval_request	9	current_step	integer	NO
business	approval_request	10	created_by	uuid	YES
business	approval_request	11	created_at	timestamp with time zone	NO
business	approval_request	12	updated_at	timestamp with time zone	NO
business	approval_request	13	due_at	timestamp with time zone	YES
business	approval_step_instance	1	request_id	uuid	NO
business	approval_step_instance	2	step_order	integer	NO
business	approval_step_instance	3	role_code	text	NO
business	approval_step_instance	4	status	USER-DEFINED	NO
business	approval_step_instance	5	due_at	timestamp with time zone	YES
business	approval_step_instance	6	escalated_count	integer	NO
business	approval_step_instance	7	last_escalated_at	timestamp with time zone	YES
business	approval_step_instance	8	decided_by	uuid	YES
business	approval_step_instance	9	decided_at	timestamp with time zone	YES
business	vw_aicm_human_review_wait_display	1	aicm_human_review_item_id	uuid	YES
business	vw_aicm_human_review_wait_display	2	owner_civilization_id	uuid	YES
business	vw_aicm_human_review_wait_display	3	aicm_user_company_id	uuid	YES
business	vw_aicm_human_review_wait_display	4	company_name	text	YES
business	vw_aicm_human_review_wait_display	5	aicm_user_company_department_id	uuid	YES
business	vw_aicm_human_review_wait_display	6	department_name	text	YES
business	vw_aicm_human_review_wait_display	7	aicm_user_company_section_id	uuid	YES
business	vw_aicm_human_review_wait_display	8	section_name	text	YES
business	vw_aicm_human_review_wait_display	9	related_president_policy_id	uuid	YES
business	vw_aicm_human_review_wait_display	10	related_manager_major_work_item_id	uuid	YES
business	vw_aicm_human_review_wait_display	11	related_leader_middle_work_item_id	uuid	YES
business	vw_aicm_human_review_wait_display	12	related_deliverable_requirement_id	uuid	YES
business	vw_aicm_human_review_wait_display	13	related_worker_work_unit_id	uuid	YES
business	vw_aicm_human_review_wait_display	14	review_kind_code	text	YES
business	vw_aicm_human_review_wait_display	15	review_kind_label	text	YES
business	vw_aicm_human_review_wait_display	16	artifact_kind_code	text	YES
business	vw_aicm_human_review_wait_display	17	artifact_kind_label	text	YES
business	vw_aicm_human_review_wait_display	18	review_title	text	YES
business	vw_aicm_human_review_wait_display	19	delivery_summary_text	text	YES
business	vw_aicm_human_review_wait_display	20	main_changes_text	text	YES
business	vw_aicm_human_review_wait_display	21	ai_review_result_text	text	YES
business	vw_aicm_human_review_wait_display	22	unresolved_issues_text	text	YES
business	vw_aicm_human_review_wait_display	23	artifact_link	text	YES
business	vw_aicm_human_review_wait_display	24	responsible_ai_label	text	YES
business	vw_aicm_human_review_wait_display	25	requested_by_ai_label	text	YES
business	vw_aicm_human_review_wait_display	26	human_review_status_code	text	YES
business	vw_aicm_human_review_wait_display	27	human_review_status_label	text	YES
business	vw_aicm_human_review_wait_display	28	priority_code	text	YES
business	vw_aicm_human_review_wait_display	29	due_date	date	YES
business	vw_aicm_human_review_wait_display	30	human_reviewer_label	text	YES
business	vw_aicm_human_review_wait_display	31	human_review_note	text	YES
business	vw_aicm_human_review_wait_display	32	requested_at	timestamp with time zone	YES
business	vw_aicm_human_review_wait_display	33	reviewed_at	timestamp with time zone	YES
business	vw_aicm_human_review_wait_display	34	display_order	integer	YES
business	vw_aicm_human_review_wait_display	35	created_at	timestamp with time zone	YES
business	vw_aicm_human_review_wait_display	36	updated_at	timestamp with time zone	YES
business	vw_aicm_human_review_wait_display	37	metadata_jsonb	jsonb	YES
(149 rows)

============================================================
4. queue rollback smoke
============================================================
BEGIN
CREATE TABLE
DO
key	value
queue_regclass	
final_static_judgement	QUEUE_TABLE_NOT_FOUND
(2 rows)
ROLLBACK

============================================================
5. persisted after rollback check
============================================================
ERROR:  relation "business.aicm_human_review_queue" does not exist
LINE 6:       FROM business.aicm_human_review_queue
                   ^
