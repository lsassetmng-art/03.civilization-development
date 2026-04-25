const queueItems = [
  "wo_stub_001 / ERP / draft / review_pending / medium",
  "wo_stub_002 / BUSINESS_BUILDER / execution / approval_pending / high",
  "wo_stub_003 / ERP / consult / ready / low"
];

const reviewItems = [
  "review_stub_001 / wo_stub_001 / ERP / RR008_PROVISIONAL_VOUCHER_CHECK"
];

const approvalItems = [
  "approval_stub_001 / wo_stub_002 / BUSINESS_BUILDER / AR006_IRREVERSIBLE_PRODUCTION_SCOPE"
];

const failureItems = [
  "fail_stub_001 / wo_stub_010 / ERP / ERP_REQUIRED_FIELD_MISSING / retryable"
];

const summaryItems = [
  "summary_stub_001 / execution_summary / 2026-04-21T12:00:00+09:00"
];

function renderList(id, items) {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }

  target.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  renderList("queueBoardList", queueItems);
  renderList("reviewInboxList", reviewItems);
  renderList("approvalInboxList", approvalItems);
  renderList("failureList", failureItems);
  renderList("summaryList", summaryItems);
});
