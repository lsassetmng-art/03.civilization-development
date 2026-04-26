window.AICM_PHASE_U_REVIEW_DATA = {
  companies: [
    {
      company_id: "company-acm-001",
      company_name: "AI Company Alpha",
      business_domain: "業務設計・開発支援",
      robot_naming_rule: "ACM-{ROLE}-{000}",
      company_policy: "人間が方針を設定し、AI組織が自動で設計・開発・レビューを進め、納品時のみ人間が確認する。",
      delivery_policy: "人間は納品候補を確認し、受領または最終差し戻しのみ行う。",
      organization_units: [
        { unit_name: "経営室", purpose: "方針と事業判断", ai_role: "President", deliverable: "事業方針と最終判断" },
        { unit_name: "運営管理部", purpose: "方針分解と進行管理", ai_role: "Manager", deliverable: "実行計画と進捗統合" },
        { unit_name: "制作リード部", purpose: "成果物単位の管理", ai_role: "Leader", deliverable: "成果物レビューと統合" },
        { unit_name: "実制作部", purpose: "実作業", ai_role: "Worker", deliverable: "設計・コード・資料" }
      ],
      role_progress: [
        { role: "President", status: "完了", detail: "会社方針を確認し、Managerへ事業指示を発行" },
        { role: "Manager", status: "進行中", detail: "事業領域をタスク群へ分解" },
        { role: "Leader", status: "待機", detail: "成果物単位でWorkerへ配布予定" },
        { role: "Worker", status: "待機", detail: "実作業待ち" }
      ],
      current_work: {
        title: "AICompanyManager Phase U 反映",
        stage: "UI / 設計反映",
        ai_review_status: "AI自動レビュー待ち",
        internal_save_status: "自動保存済み",
        updated_at_label: "mock latest"
      },
      delivery: {
        title: "Phase U レビュー反映版",
        status: "納品準備中",
        human_gate: "納品時のみ人間確認"
      }
    },
    {
      company_id: "company-acm-002",
      company_name: "AI Company Beta",
      business_domain: "調査・資料作成",
      robot_naming_rule: "BETA-{DEPT}-{ROLE}-{000}",
      company_policy: "調査から資料化までをAI組織で進める。",
      delivery_policy: "最終資料だけ人間確認。",
      organization_units: [
        { unit_name: "調査室", purpose: "情報収集", ai_role: "Worker", deliverable: "調査メモ" },
        { unit_name: "編集室", purpose: "資料化", ai_role: "Leader", deliverable: "提出資料" }
      ],
      role_progress: [
        { role: "President", status: "未着手", detail: "方針待ち" },
        { role: "Manager", status: "未着手", detail: "分解待ち" },
        { role: "Leader", status: "未着手", detail: "統合待ち" },
        { role: "Worker", status: "未着手", detail: "作業待ち" }
      ],
      current_work: {
        title: "未開始",
        stage: "設定待ち",
        ai_review_status: "未実施",
        internal_save_status: "自動保存対象外",
        updated_at_label: "mock"
      },
      delivery: {
        title: "未作成",
        status: "未納品",
        human_gate: "納品候補なし"
      }
    }
  ]
};
