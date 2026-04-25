window.AICM_MOCK_DATA = {
  company: {
    name: "AICompanyManager Demo Company",
    summary: "人間方針をPresidentへ渡し、Manager / Leader / Workerで成果物を作るAI企業運営デモです。",
    metrics: [
      { label: "進行中案件", value: "3" },
      { label: "レビュー待ち", value: "5" },
      { label: "差し戻し", value: "1" },
      { label: "納品待ち", value: "2" }
    ]
  },
  roles: [
    { role: "President", status: "待機", detail: "方針入力待ち" },
    { role: "Manager", status: "待機", detail: "President計画待ち" },
    { role: "Leader", status: "待機", detail: "Manager指示待ち" },
    { role: "Worker", status: "待機", detail: "Leaderタスク待ち" }
  ],
  reviews: [
    {
      id: "review-001",
      deliverable_id: "deliverable-001",
      title: "市場調査メモ",
      reviewer_role: "leader",
      status: "pending",
      detail: "Leader一次レビュー待ち"
    },
    {
      id: "review-002",
      deliverable_id: "deliverable-002",
      title: "提案書ドラフト",
      reviewer_role: "leader",
      status: "returned",
      detail: "構成修正のためWorkerへ差し戻し中"
    }
  ],
  deliveries: [
    {
      id: "delivery-row-001",
      delivery_id: "delivery-001",
      approval_id: "approval-001",
      deliverable_id: "deliverable-final-001",
      title: "統合事業計画 v1",
      status: "human_approval_waiting",
      approval_status: "waiting",
      detail: "President最終確認済み。人間承認待ち"
    },
    {
      id: "delivery-row-002",
      delivery_id: "delivery-002",
      approval_id: "approval-002",
      deliverable_id: "deliverable-final-002",
      title: "営業アクション一覧",
      status: "prepared",
      approval_status: "approved",
      detail: "納品準備済み"
    }
  ],
  queue: [
    { id: "queue-initial-1", type: "policy_submit", status: "synced", detail: "初期サンプル方針送信済み" }
  ],
  events: [
    { type: "system_ready", message: "AICompanyManager Phase K runtime ready", created_at: new Date().toISOString() }
  ]
};
