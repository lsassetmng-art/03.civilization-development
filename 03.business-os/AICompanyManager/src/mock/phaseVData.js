window.AICM_PHASE_V_DATA = {
  aiworkers: [
    { aiworker_id: "aiw-president-001", display_name: "President Alpha", role_family: "President", series: "HD", specialty: "事業方針と最終判断" },
    { aiworker_id: "aiw-president-002", display_name: "President Beta", role_family: "President", series: "MEGAMI", specialty: "長期方針と複数会社統括" },
    { aiworker_id: "aiw-manager-001", display_name: "Manager Alpha", role_family: "Manager", series: "HD", specialty: "進行管理とタスク分解" },
    { aiworker_id: "aiw-manager-002", display_name: "Manager Beta", role_family: "Manager", series: "LoVerS", specialty: "納品管理と顧客対応" },
    { aiworker_id: "aiw-leader-001", display_name: "Leader Alpha", role_family: "Leader", series: "HD", specialty: "成果物統合と品質確認" },
    { aiworker_id: "aiw-leader-002", display_name: "Leader Beta", role_family: "Leader", series: "MEGAMI", specialty: "調査成果物の統合" },
    { aiworker_id: "aiw-worker-001", display_name: "Worker Alpha", role_family: "Worker", series: "HD", specialty: "設計・実装・資料作成" },
    { aiworker_id: "aiw-worker-002", display_name: "Worker Beta", role_family: "Worker", series: "MEGAMI", specialty: "調査・整理・文書化" },
    { aiworker_id: "aiw-worker-003", display_name: "Worker Gamma", role_family: "Worker", series: "LoVerS", specialty: "チェックリスト化と案内" }
  ],
  companies: [
    {
      company_id: "company-acm-001",
      company_name: "AI Company Alpha",
      business_domain: "業務設計・開発支援",
      company_policy: "人間が設定し、AI組織が自動で進行し、納品時のみ人間が確認する。",
      delivery_policy: "納品時のみ人間確認",
      organization_trees: [
        {
          tree_id: "tree-alpha-dev",
          tree_name: "経営・開発ツリー",
          tree_purpose: "設計と開発を進める主組織",
          units: [
            { unit_id: "unit-001", parent_unit_id: "", unit_name: "経営室", purpose: "方針と事業判断", ai_role: "President", robot_name: "アルファ社長", aiworker_id: "aiw-president-001", deliverable: "事業方針と最終判断" },
            { unit_id: "unit-002", parent_unit_id: "unit-001", unit_name: "運営管理部", purpose: "方針分解と進行管理", ai_role: "Manager", robot_name: "進行管理一号", aiworker_id: "aiw-manager-001", deliverable: "実行計画と進捗統合" },
            { unit_id: "unit-003", parent_unit_id: "unit-002", unit_name: "制作リード部", purpose: "成果物単位の管理", ai_role: "Leader", robot_name: "制作リード一号", aiworker_id: "aiw-leader-001", deliverable: "成果物レビューと統合" },
            { unit_id: "unit-004", parent_unit_id: "unit-003", unit_name: "実制作部", purpose: "実作業", ai_role: "Worker", robot_name: "実制作一号", aiworker_id: "aiw-worker-001", deliverable: "設計・コード・資料" }
          ]
        },
        {
          tree_id: "tree-alpha-delivery",
          tree_name: "納品・改善ツリー",
          tree_purpose: "納品前確認と改善を扱う補助組織",
          units: [
            { unit_id: "unit-101", parent_unit_id: "", unit_name: "納品管理室", purpose: "納品候補の整理", ai_role: "Manager", robot_name: "納品管理一号", aiworker_id: "aiw-manager-002", deliverable: "納品確認リスト" },
            { unit_id: "unit-102", parent_unit_id: "unit-101", unit_name: "改善作業班", purpose: "差し戻し対応", ai_role: "Worker", robot_name: "改善作業一号", aiworker_id: "aiw-worker-003", deliverable: "修正反映" }
          ]
        }
      ],
      role_progress: [
        { role: "President", status: "完了", detail: "会社方針を確認済み" },
        { role: "Manager", status: "進行中", detail: "タスク分解中" },
        { role: "Leader", status: "待機", detail: "成果物統合待ち" },
        { role: "Worker", status: "待機", detail: "実作業待ち" }
      ],
      current_task: {
        task_title: "Phase X 画面分離・ロボット個別命名反映",
        task_state: "実装反映中",
        task_owner_role: "Manager",
        selected_aiworker_id: "aiw-manager-001",
        input_materials: "レビュー結果、Phase W成果物、既存mock UI",
        output_expectation: "会社追加/会社変更/組織追加/組織変更の画面分離と名前@ロール表示"
      },
      delivery: {
        delivery_title: "Phase X 画面分離・ロボット個別命名反映版",
        delivery_status: "納品準備中"
      },
      handoffs: []
    }
  ]
};
