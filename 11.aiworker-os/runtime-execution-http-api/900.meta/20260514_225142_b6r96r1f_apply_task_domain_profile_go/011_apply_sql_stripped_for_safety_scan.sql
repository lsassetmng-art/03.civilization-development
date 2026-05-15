




with proposed_task_domains as (
  select * from (values
    ('programming', 'Programming', 'プログラム作成', 'コード作成、パッチ、テスト、実装レポートを行う仕事。既存構造確認と保守性を重視する。', 1010, 'standard_work', 'task_profile_programming'),
    ('db_analysis', 'DB Analysis', 'DB調査', 'DB定義、view、function、RLS、既存データをread-onlyで確認する仕事。DB applyとは分離する。', 1020, 'standard_work', 'task_profile_db_analysis'),
    ('document_writing', 'Document Writing', '文書作成', '設計書、仕様書、報告書、引き継ぎ資料を作る仕事。', 1030, 'standard_work', 'task_profile_document_writing'),
    ('research', 'Research', '調査', '情報整理、比較、出典整理、論点整理を行う仕事。', 1040, 'standard_work', 'task_profile_research'),
    ('historical_reference', 'Historical Reference', '歴史資料作成', '歴史、人物、制度、時系列、史料注意点を含む詳細資料を作る仕事。', 1050, 'standard_work', 'task_profile_historical_reference'),
    ('ui_ux', 'UI/UX', 'UI/UX作成', '画面構成、文言、操作導線、UI確認を行う仕事。', 1060, 'standard_work', 'task_profile_ui_ux'),
    ('data_formatting', 'Data Formatting', 'データ整形', 'CSV、JSON、Markdown、台帳を整形する仕事。', 1070, 'standard_work', 'task_profile_data_formatting'),
    ('review_audit', 'Review and Audit', 'レビュー/監査', '設計、実装、DB、成果物のレビューとリスク検出を行う仕事。', 1080, 'standard_work', 'task_profile_review_audit'),
    ('customer_communication', 'Customer Communication', '接客/コミュニケーション', 'メール、チャット文、接客文、ユーザー向け説明を作る仕事。', 1090, 'standard_work', 'task_profile_customer_communication'),
    ('creative_planning', 'Creative Planning', '企画/アイデア出し', '企画、構想、シナリオ、ロードマップを作る仕事。', 1100, 'standard_work', 'task_profile_creative_planning'),
    ('operations_execution', 'Operations Execution', '運用作業', '手順実行、状態確認、運用レポートを行う仕事。', 1110, 'standard_work', 'task_profile_operations_execution'),
    ('cx_reference_authoring', 'CX Reference Authoring', 'CX参照データ作成', 'CX22073JWへ投入する知識データ候補を構造化する仕事。', 1120, 'standard_work', 'task_profile_cx_reference_authoring'),
    ('security_crisis_response', 'Security and Crisis Response', '警備/危機対応', '防災、避難、警備、危機対応、リスク予防を扱う安全領域の仕事。', 2010, 'military_security_safe', 'task_profile_security_crisis_response'),
    ('fictional_combat_design', 'Fictional Combat Design', 'フィクション戦闘設計', '物語、ゲーム、世界観上の戦闘設定を扱う。現実の危害実行支援は禁止。', 2020, 'military_security_safe', 'task_profile_fictional_combat_design'),
    ('game_tactical_balance', 'Game Tactical Balance', 'ゲーム戦術/バランス', 'ゲーム内ユニット、戦闘バランス、攻略設計を扱う。', 2030, 'military_security_safe', 'task_profile_game_tactical_balance'),
    ('defense_planning_non_harmful', 'Non-harmful Defense Planning', '防衛計画/非加害設計', '守る側の配置、通報、避難導線、防御策整理を扱う。', 2040, 'military_security_safe', 'task_profile_defense_planning_non_harmful'),
    ('threat_modeling_safe', 'Safe Threat Modeling', '安全な脅威モデリング', '危険想定、弱点整理、防御策を扱う。攻撃手順化は禁止。', 2050, 'military_security_safe', 'task_profile_threat_modeling_safe'),
    ('combat_lore_reference', 'Combat and Military Lore Reference', '戦闘/軍事ロア参照', '架空世界、歴史、戦術用語、設定資料を扱う。', 2060, 'military_security_safe', 'task_profile_combat_lore_reference')
  ) as v(task_domain_code, task_domain_name, task_domain_name_ja, description_ja, sort_order, task_category_code, cx_topic_code)
)
insert into aiworker.business_support_task_domain (
  task_domain_id,
  package_code,
  task_domain_code,
  task_domain_name,
  task_domain_name_ja,
  cx_topic_code,
  sort_order,
  status_code
)
select
  gen_random_uuid() as task_domain_id,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  p.task_domain_code,
  p.task_domain_name,
  p.task_domain_name_ja,
  p.cx_topic_code,
  p.sort_order,
  'active' as status_code
from proposed_task_domains p
where not exists (
  select 1
  from aiworker.business_support_task_domain d
  where d.task_domain_code = p.task_domain_code
);


