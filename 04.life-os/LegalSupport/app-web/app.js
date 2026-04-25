(function () {
  const C = window.LifeWebCommon;
  const KEY = "lifeos_legalsupport_records";

  C.mountPersonaBackground("legalsupport");

  document.getElementById("formArea").innerHTML = `
    <div class="row">
      <div>
        <label>Issue Title</label>
        <input id="issueTitle" type="text" placeholder="Lease renewal consultation">
      </div>
      <div>
        <label>Issue Type</label>
        <select id="issueType">
          <option>Family</option>
          <option>Housing</option>
          <option>Work</option>
          <option>Contract</option>
          <option>Inheritance</option>
          <option>Trouble</option>
        </select>
      </div>
      <div>
        <label>Status</label>
        <select id="status">
          <option>Draft</option>
          <option>Preparing</option>
          <option>Consulted</option>
          <option>Resolved</option>
        </select>
      </div>
      <div>
        <label>Urgency</label>
        <select id="urgency">
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
    </div>

    <div class="row">
      <div>
        <label>Target Date</label>
        <input id="targetDate" type="date">
      </div>
      <div>
        <label>Advisor</label>
        <input id="advisor" type="text" placeholder="Lawyer or consultation desk">
      </div>
      <div>
        <label>Document Readiness</label>
        <select id="documentReadiness">
          <option>Missing</option>
          <option>Partial</option>
          <option>Ready</option>
        </select>
      </div>
      <div>
        <label>Need Follow-up</label>
        <select id="followUp">
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>
    </div>

    <div class="full">
      <label>Memo</label>
      <textarea id="memo" placeholder="Facts, questions, next steps"></textarea>
    </div>

    <div class="actions">
      <button id="saveBtn">Save Issue</button>
      <button id="sampleBtn" class="secondary">Insert Sample</button>
    </div>
  `;

  const issueTitle = document.getElementById("issueTitle");
  const issueType = document.getElementById("issueType");
  const status = document.getElementById("status");
  const urgency = document.getElementById("urgency");
  const targetDate = document.getElementById("targetDate");
  const advisor = document.getElementById("advisor");
  const documentReadiness = document.getElementById("documentReadiness");
  const followUp = document.getElementById("followUp");
  const memo = document.getElementById("memo");
  const saveBtn = document.getElementById("saveBtn");
  const sampleBtn = document.getElementById("sampleBtn");
  const clearDataBtn = document.getElementById("clearDataBtn");
  const summary = document.getElementById("summary");
  const records = document.getElementById("records");

  targetDate.value = C.today();

  function read() { return C.readJson(KEY, []); }
  function write(items) { C.writeJson(KEY, items); }

  function renderSummary(items) {
    const preparingCount = items.filter(function (x) { return x.status === "Preparing"; }).length;
    const resolvedCount = items.filter(function (x) { return x.status === "Resolved"; }).length;
    const readyDocs = items.filter(function (x) { return x.documentReadiness === "Ready"; }).length;
    const highUrgency = items.filter(function (x) { return x.urgency === "High"; }).length;

    summary.innerHTML = `
      <div class="metric">
        <div class="label">Issues</div>
        <div class="value">${items.length}</div>
      </div>
      <div class="metric">
        <div class="label">Preparing</div>
        <div class="value">${preparingCount}</div>
      </div>
      <div class="metric">
        <div class="label">Resolved</div>
        <div class="value">${resolvedCount}</div>
      </div>
      <div class="metric">
        <div class="label">Ready Docs</div>
        <div class="value">${readyDocs}</div>
      </div>
      <div class="metric">
        <div class="label">High Urgency</div>
        <div class="value">${highUrgency}</div>
      </div>
    `;
  }

  function readinessClass(value) {
    if (value === "Ready") return "pill ok";
    if (value === "Missing") return "pill warn";
    return "pill";
  }

  function renderList(items) {
    if (!items.length) {
      records.innerHTML = `<div class="empty">No legal issues yet</div>`;
      return;
    }

    records.innerHTML = items.map(function (item) {
      return `
        <div class="item">
          <div class="head">
            <span>${C.esc(item.issueTitle)}</span>
            <span class="${readinessClass(item.documentReadiness)}">${C.esc(item.documentReadiness)}</span>
          </div>
          <div class="sub">
Type: ${C.esc(item.issueType)} / Status: ${C.esc(item.status)} / Urgency: ${C.esc(item.urgency)}
Target Date: ${C.esc(item.targetDate)} / Advisor: ${C.esc(item.advisor || "-")} / Follow-up: ${C.esc(item.followUp)}
${C.esc(item.memo || "")}
          </div>
        </div>
      `;
    }).join("");
  }

  function render() {
    const items = read().sort(function (a, b) {
      return String(b.targetDate).localeCompare(String(a.targetDate));
    });
    renderSummary(items);
    renderList(items);
  }

  saveBtn.addEventListener("click", function () {
    const items = read();
    items.push({
      issueTitle: issueTitle.value.trim(),
      issueType: issueType.value,
      status: status.value,
      urgency: urgency.value,
      targetDate: targetDate.value || "",
      advisor: advisor.value.trim(),
      documentReadiness: documentReadiness.value,
      followUp: followUp.value,
      memo: memo.value.trim()
    });
    write(items);
    issueTitle.value = "";
    advisor.value = "";
    memo.value = "";
    render();
  });

  sampleBtn.addEventListener("click", function () {
    issueTitle.value = "Lease renewal consultation";
    issueType.value = "Housing";
    status.value = "Preparing";
    urgency.value = "High";
    targetDate.value = C.today();
    advisor.value = "Local legal consultation desk";
    documentReadiness.value = "Partial";
    followUp.value = "Yes";
    memo.value = "Collect lease, notice, and payment history";
  });

  clearDataBtn.addEventListener("click", function () {
    localStorage.removeItem(KEY);
    render();
  });

  render();
})();
