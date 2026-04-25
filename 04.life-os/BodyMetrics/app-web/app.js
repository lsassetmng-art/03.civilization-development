(function () {
  const C = window.LifeWebCommon;
  const KEY = "lifeos_bodymetrics_records";

  C.mountPersonaBackground("bodymetrics");

  document.getElementById("formArea").innerHTML = `
    <div class="row">
      <div>
        <label>Date</label>
        <input id="date" type="date">
      </div>
      <div>
        <label>Weight kg</label>
        <input id="weight" type="number" step="0.1" placeholder="62.4">
      </div>
      <div>
        <label>Body Fat %</label>
        <input id="bodyFat" type="number" step="0.1" placeholder="18.2">
      </div>
      <div>
        <label>Sleep Hours</label>
        <input id="sleepHours" type="number" step="0.1" placeholder="7.5">
      </div>
    </div>
    <div class="full">
      <label>Memo</label>
      <textarea id="memo" placeholder="Condition notes"></textarea>
    </div>
    <div class="actions">
      <button id="saveBtn">Save Record</button>
      <button id="sampleBtn" class="secondary">Insert Sample</button>
    </div>
  `;

  const date = document.getElementById("date");
  const weight = document.getElementById("weight");
  const bodyFat = document.getElementById("bodyFat");
  const sleepHours = document.getElementById("sleepHours");
  const memo = document.getElementById("memo");
  const saveBtn = document.getElementById("saveBtn");
  const sampleBtn = document.getElementById("sampleBtn");
  const clearDataBtn = document.getElementById("clearDataBtn");
  const summary = document.getElementById("summary");
  const records = document.getElementById("records");

  date.value = C.today();

  function read() {
    return C.readJson(KEY, []);
  }

  function write(items) {
    C.writeJson(KEY, items);
  }

  function renderSummary(items) {
    const latest = items[0];
    const weights = items.map(x => Number(x.weight || 0)).filter(x => x > 0).slice(0, 7);
    const sleeps = items.map(x => Number(x.sleepHours || 0)).filter(x => x > 0).slice(0, 7);

    summary.innerHTML = `
      <div class="metric">
        <div class="label">Records</div>
        <div class="value">${items.length}</div>
      </div>
      <div class="metric">
        <div class="label">Latest Weight</div>
        <div class="value">${latest ? C.esc(latest.weight) : "-"}</div>
      </div>
      <div class="metric">
        <div class="label">7d Avg Weight</div>
        <div class="value">${weights.length ? C.average(weights).toFixed(1) : "-"}</div>
      </div>
      <div class="metric">
        <div class="label">7d Avg Sleep</div>
        <div class="value">${sleeps.length ? C.average(sleeps).toFixed(1) : "-"}</div>
      </div>
    `;
  }

  function renderList(items) {
    if (!items.length) {
      records.innerHTML = `<div class="empty">No records yet</div>`;
      return;
    }

    records.innerHTML = items.map(item => `
      <div class="item">
        <div class="head">
          <span>${C.esc(item.date)}</span>
          <span>${C.esc(item.weight)} kg</span>
        </div>
        <div class="sub">Body Fat: ${C.esc(item.bodyFat)}% / Sleep: ${C.esc(item.sleepHours)}h
${C.esc(item.memo || "")}</div>
      </div>
    `).join("");
  }

  function render() {
    const items = read()
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    renderSummary(items);
    renderList(items);
  }

  saveBtn.addEventListener("click", function () {
    const item = {
      date: date.value || C.today(),
      weight: weight.value || "",
      bodyFat: bodyFat.value || "",
      sleepHours: sleepHours.value || "",
      memo: memo.value.trim()
    };
    const items = read();
    items.push(item);
    write(items);
    weight.value = "";
    bodyFat.value = "";
    sleepHours.value = "";
    memo.value = "";
    render();
  });

  sampleBtn.addEventListener("click", function () {
    weight.value = "62.4";
    bodyFat.value = "18.2";
    sleepHours.value = "7.3";
    memo.value = "Morning check sample";
  });

  clearDataBtn.addEventListener("click", function () {
    localStorage.removeItem(KEY);
    render();
  });

  render();
})();
