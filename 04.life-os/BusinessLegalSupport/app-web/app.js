(function () {
  const C = window.LifeWebCommon;
  const KEY = "lifeos_businesslegalsupport_records";

  C.mountPersonaBackground("businesslegalsupport");

  document.getElementById("formArea").innerHTML = `
    <div class="row">
      <div>
        <label>Case Title</label>
        <input id="caseTitle" type="text" placeholder="Vendor contract review">
      </div>
      <div>
        <label>Case Type</label>
        <select id="caseType">
          <option>Contract Review</option>
          <option>Policy</option>
          <option>Compliance</option>
          <option>Dispute</option>
          <option>Employment</option>
          <option>IP</option>
        </select>
      </div>
      <div>
        <label>Status</label>
        <select id="status">
          <option>Draft</option>
          <option>In Review</option>
          <option>Waiting Reply</option>
          <option>Closed</option>
        </select>
      </div>
      <div>
        <label>Priority</label>
        <select id="priority">
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
    </div>

    <div class="row">
      <div>
        <label>Counterparty</label>
        <input id="counterparty" type="text" placeholder="Vendor or partner">
      </div>
      <div>
        <label>Owner</label>
        <input id="owner" type="text" placeholder="Internal owner">
      </div>
      <div>
        <label>Due Date</label>
        <input id="dueDate" type="date">
      </div>
      <div>
        <label>Risk Level</label>
        <select id="riskLevel">
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
    </div>

    <div class="full">
      <label>Memo</label>
      <textarea id="memo" placeholder="Clause concern, follow-up item, or internal note"></textarea>
    </div>

    <div class="actions">
      <button id="saveBtn">Save Case</button>
      <button id="sampleBtn" class="secondary">Insert Sample</button>
    </div>
  `;

  const caseTitle = document.getElementById("caseTitle");
  const caseType = document.getElementById("caseType");
  const status = document.getElementById("status");
  const priority = document.getElementById("priority");
  const counterparty = document.getElementById("counterparty");
  const owner = document.getElementById("owner");
  const dueDate = document.getElementById("dueDate");
  const riskLevel = document.getElementById("riskLevel");
  const memo = document.getElementById("memo");
  const saveBtn = document.getElementById("saveBtn");
  const sampleBtn = document.getElementById("sampleBtn");
  const clearDataBtn = document.getElementById("clearDataBtn");
  const summary = document.getElementById("summary");
  const records = document.getElementById("records");

  dueDate.value = C.today();

  function read() { return C.readJson(KEY, []); }
  function write(items) { C.writeJson(KEY, items); }

  function renderSummary(items) {
    const reviewCount = items.filter(function (x) { return x.status === "In Review"; }).length;
    const waitingCount = items.filter(function (x) { return x.status === "Waiting Reply"; }).length;
    const highRisk = items.filter(function (x) { return x.riskLevel === "High"; }).length;
    const contractCount = items.filter(function (x) { return x.caseType === "Contract Review"; }).length;

    summary.innerHTML = `
      <div class="metric">
        <div class="label">Cases</div>
        <div class="value">${items.length}</div>
      </div>
      <div class="metric">
        <div class="label">In Review</div>
        <div class="value">${reviewCount}</div>
      </div>
      <div class="metric">
        <div class="label">Waiting Reply</div>
        <div class="value">${waitingCount}</div>
      </div>
      <div class="metric">
        <div class="label">High Risk</div>
        <div class="value">${highRisk}</div>
      </div>
      <div class="metric">
        <div class="label">Contract Review</div>
        <div class="value">${contractCount}</div>
      </div>
    `;
  }

  function riskClass(value) {
    if (value === "High") return "pill warn";
    if (value === "Low") return "pill ok";
    return "pill";
  }

  function renderList(items) {
    if (!items.length) {
      records.innerHTML = `<div class="empty">No business legal cases yet</div>`;
      return;
    }

    records.innerHTML = items.map(function (item) {
      return `
        <div class="item">
          <div class="head">
            <span>${C.esc(item.caseTitle)}</span>
            <span class="${riskClass(item.riskLevel)}">${C.esc(item.riskLevel)}</span>
          </div>
          <div class="sub">
Type: ${C.esc(item.caseType)} / Status: ${C.esc(item.status)} / Priority: ${C.esc(item.priority)}
Counterparty: ${C.esc(item.counterparty || "-")} / Owner: ${C.esc(item.owner || "-")} / Due: ${C.esc(item.dueDate)}
${C.esc(item.memo || "")}
          </div>
        </div>
      `;
    }).join("");
  }

  function render() {
    const items = read().sort(function (a, b) {
      return String(b.dueDate).localeCompare(String(a.dueDate));
    });
    renderSummary(items);
    renderList(items);
  }

  saveBtn.addEventListener("click", function () {
    const items = read();
    items.push({
      caseTitle: caseTitle.value.trim(),
      caseType: caseType.value,
      status: status.value,
      priority: priority.value,
      counterparty: counterparty.value.trim(),
      owner: owner.value.trim(),
      dueDate: dueDate.value || "",
      riskLevel: riskLevel.value,
      memo: memo.value.trim()
    });
    write(items);
    caseTitle.value = "";
    counterparty.value = "";
    owner.value = "";
    memo.value = "";
    render();
  });

  sampleBtn.addEventListener("click", function () {
    caseTitle.value = "Vendor contract review";
    caseType.value = "Contract Review";
    status.value = "In Review";
    priority.value = "High";
    counterparty.value = "ABC Vendor";
    owner.value = "Operations Lead";
    dueDate.value = C.today();
    riskLevel.value = "High";
    memo.value = "Review termination, SLA, and liability clauses";
  });

  clearDataBtn.addEventListener("click", function () {
    localStorage.removeItem(KEY);
    render();
  });

  render();
})();
