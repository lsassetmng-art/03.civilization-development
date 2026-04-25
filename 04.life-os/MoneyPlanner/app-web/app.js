(function () {
  const C = window.LifeWebCommon;
  const KEY = "lifeos_moneyplanner_records";

  C.mountPersonaBackground("moneyplanner");

  document.getElementById("formArea").innerHTML = `
    <div class="row">
      <div>
        <label>Date</label>
        <input id="date" type="date">
      </div>
      <div>
        <label>Type</label>
        <select id="type">
          <option>Income</option>
          <option>Expense</option>
        </select>
      </div>
      <div>
        <label>Category</label>
        <input id="category" type="text" placeholder="Food / Salary / Transport">
      </div>
      <div>
        <label>Amount JPY</label>
        <input id="amount" type="number" step="1" placeholder="3000">
      </div>
    </div>
    <div class="full">
      <label>Memo</label>
      <textarea id="memo" placeholder="Record note"></textarea>
    </div>
    <div class="actions">
      <button id="saveBtn">Save Entry</button>
      <button id="sampleBtn" class="secondary">Insert Sample</button>
    </div>
  `;

  const date = document.getElementById("date");
  const type = document.getElementById("type");
  const category = document.getElementById("category");
  const amount = document.getElementById("amount");
  const memo = document.getElementById("memo");
  const saveBtn = document.getElementById("saveBtn");
  const sampleBtn = document.getElementById("sampleBtn");
  const clearDataBtn = document.getElementById("clearDataBtn");
  const summary = document.getElementById("summary");
  const records = document.getElementById("records");

  date.value = C.today();

  function read() { return C.readJson(KEY, []); }
  function write(items) { C.writeJson(KEY, items); }

  function renderSummary(items) {
    const nowMonth = C.today().slice(0, 7);
    const monthItems = items.filter(x => String(x.date).slice(0, 7) === nowMonth);
    const income = C.sum(monthItems.filter(x => x.type === "Income").map(x => Number(x.amount || 0)));
    const expense = C.sum(monthItems.filter(x => x.type === "Expense").map(x => Number(x.amount || 0)));
    const balance = income - expense;

    summary.innerHTML = `
      <div class="metric">
        <div class="label">Entries</div>
        <div class="value">${items.length}</div>
      </div>
      <div class="metric">
        <div class="label">Month Income</div>
        <div class="value money-positive">${income}</div>
      </div>
      <div class="metric">
        <div class="label">Month Expense</div>
        <div class="value money-negative">${expense}</div>
      </div>
      <div class="metric">
        <div class="label">Month Balance</div>
        <div class="value">${balance}</div>
      </div>
    `;
  }

  function renderList(items) {
    if (!items.length) {
      records.innerHTML = `<div class="empty">No entries yet</div>`;
      return;
    }

    records.innerHTML = items.map(item => `
      <div class="item">
        <div class="head">
          <span>${C.esc(item.date)} / ${C.esc(item.type)}</span>
          <span>${C.esc(item.amount)} JPY</span>
        </div>
        <div class="sub">${C.esc(item.category)}
${C.esc(item.memo || "")}</div>
      </div>
    `).join("");
  }

  function render() {
    const items = read().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    renderSummary(items);
    renderList(items);
  }

  saveBtn.addEventListener("click", function () {
    const items = read();
    items.push({
      date: date.value || C.today(),
      type: type.value,
      category: category.value.trim(),
      amount: amount.value || "",
      memo: memo.value.trim()
    });
    write(items);
    category.value = "";
    amount.value = "";
    memo.value = "";
    render();
  });

  sampleBtn.addEventListener("click", function () {
    type.value = "Expense";
    category.value = "Food";
    amount.value = "1200";
    memo.value = "Lunch sample";
  });

  clearDataBtn.addEventListener("click", function () {
    localStorage.removeItem(KEY);
    render();
  });

  render();
})();
