(function () {
  const C = window.LifeWebCommon;
  const KEY = "lifeos_careerlaunch_records";

  C.mountPersonaBackground("careerlaunch");

  document.getElementById("formArea").innerHTML = `
    <div class="row">
      <div>
        <label>Company</label>
        <input id="company" type="text" placeholder="OpenAI Japan">
      </div>
      <div>
        <label>Position</label>
        <input id="position" type="text" placeholder="Product Manager">
      </div>
      <div>
        <label>Stage</label>
        <select id="stage">
          <option>Draft</option>
          <option>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Closed</option>
        </select>
      </div>
      <div>
        <label>Due Date</label>
        <input id="dueDate" type="date">
      </div>
    </div>
    <div class="full">
      <label>Note</label>
      <textarea id="note" placeholder="Resume / interview note"></textarea>
    </div>
    <div class="actions">
      <button id="saveBtn">Save Application</button>
      <button id="sampleBtn" class="secondary">Insert Sample</button>
    </div>
  `;

  const company = document.getElementById("company");
  const position = document.getElementById("position");
  const stage = document.getElementById("stage");
  const dueDate = document.getElementById("dueDate");
  const note = document.getElementById("note");
  const saveBtn = document.getElementById("saveBtn");
  const sampleBtn = document.getElementById("sampleBtn");
  const clearDataBtn = document.getElementById("clearDataBtn");
  const summary = document.getElementById("summary");
  const records = document.getElementById("records");

  dueDate.value = C.today();

  function read() { return C.readJson(KEY, []); }
  function write(items) { C.writeJson(KEY, items); }

  function countBy(items, stageName) {
    return items.filter(x => x.stage === stageName).length;
  }

  function renderSummary(items) {
    summary.innerHTML = `
      <div class="metric">
        <div class="label">Applications</div>
        <div class="value">${items.length}</div>
      </div>
      <div class="metric">
        <div class="label">Applied</div>
        <div class="value">${countBy(items, "Applied")}</div>
      </div>
      <div class="metric">
        <div class="label">Interview</div>
        <div class="value">${countBy(items, "Interview")}</div>
      </div>
      <div class="metric">
        <div class="label">Offer</div>
        <div class="value">${countBy(items, "Offer")}</div>
      </div>
    `;
  }

  function renderList(items) {
    if (!items.length) {
      records.innerHTML = `<div class="empty">No applications yet</div>`;
      return;
    }

    records.innerHTML = items.map(item => `
      <div class="item">
        <div class="head">
          <span>${C.esc(item.company)} / ${C.esc(item.position)}</span>
          <span class="stage-badge">${C.esc(item.stage)}</span>
        </div>
        <div class="sub">Due: ${C.esc(item.dueDate)}
${C.esc(item.note || "")}</div>
      </div>
    `).join("");
  }

  function render() {
    const items = read().sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
    renderSummary(items);
    renderList(items);
  }

  saveBtn.addEventListener("click", function () {
    const items = read();
    items.push({
      company: company.value.trim(),
      position: position.value.trim(),
      stage: stage.value,
      dueDate: dueDate.value || C.today(),
      note: note.value.trim()
    });
    write(items);
    company.value = "";
    position.value = "";
    note.value = "";
    render();
  });

  sampleBtn.addEventListener("click", function () {
    company.value = "OpenAI Japan";
    position.value = "Product Manager";
    stage.value = "Applied";
    note.value = "Resume submitted sample";
  });

  clearDataBtn.addEventListener("click", function () {
    localStorage.removeItem(KEY);
    render();
  });

  render();
})();
