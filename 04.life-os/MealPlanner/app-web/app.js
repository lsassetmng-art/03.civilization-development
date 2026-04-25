(function () {
  const C = window.LifeWebCommon;
  const KEY = "lifeos_mealplanner_records";

  C.mountPersonaBackground("mealplanner");

  document.getElementById("formArea").innerHTML = `
    <div class="row">
      <div>
        <label>Date</label>
        <input id="date" type="date">
      </div>
      <div>
        <label>Meal Type</label>
        <select id="mealType">
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
          <option>Snack</option>
        </select>
      </div>
      <div>
        <label>Calories</label>
        <input id="calories" type="number" step="1" placeholder="540">
      </div>
      <div>
        <label>Protein g</label>
        <input id="protein" type="number" step="1" placeholder="24">
      </div>
    </div>
    <div class="full">
      <label>Menu</label>
      <input id="menu" type="text" placeholder="Chicken salad bowl">
    </div>
    <div class="full">
      <label>Memo</label>
      <textarea id="memo" placeholder="Prep notes"></textarea>
    </div>
    <div class="actions">
      <button id="saveBtn">Save Meal</button>
      <button id="sampleBtn" class="secondary">Insert Sample</button>
    </div>
  `;

  const date = document.getElementById("date");
  const mealType = document.getElementById("mealType");
  const calories = document.getElementById("calories");
  const protein = document.getElementById("protein");
  const menu = document.getElementById("menu");
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
    const today = C.today();
    const todays = items.filter(x => x.date === today);
    const todaysCalories = C.sum(todays.map(x => Number(x.calories || 0)));
    const todaysProtein = C.sum(todays.map(x => Number(x.protein || 0)));

    summary.innerHTML = `
      <div class="metric">
        <div class="label">Meals</div>
        <div class="value">${items.length}</div>
      </div>
      <div class="metric">
        <div class="label">Today Meals</div>
        <div class="value">${todays.length}</div>
      </div>
      <div class="metric">
        <div class="label">Today Calories</div>
        <div class="value">${todaysCalories}</div>
      </div>
      <div class="metric">
        <div class="label">Today Protein</div>
        <div class="value">${todaysProtein} g</div>
      </div>
    `;
  }

  function renderList(items) {
    if (!items.length) {
      records.innerHTML = `<div class="empty">No meals yet</div>`;
      return;
    }

    records.innerHTML = items.map(item => `
      <div class="item">
        <div class="head">
          <span>${C.esc(item.date)} / ${C.esc(item.mealType)}</span>
          <span>${C.esc(item.calories)} kcal</span>
        </div>
        <div class="sub">${C.esc(item.menu)} / Protein ${C.esc(item.protein)} g
${C.esc(item.memo || "")}</div>
      </div>
    `).join("");
  }

  function render() {
    const items = read()
      .sort((a, b) => (String(b.date) + String(b.mealType)).localeCompare(String(a.date) + String(a.mealType)));
    renderSummary(items);
    renderList(items);
  }

  saveBtn.addEventListener("click", function () {
    const items = read();
    items.push({
      date: date.value || C.today(),
      mealType: mealType.value,
      calories: calories.value || "",
      protein: protein.value || "",
      menu: menu.value.trim(),
      memo: memo.value.trim()
    });
    write(items);
    calories.value = "";
    protein.value = "";
    menu.value = "";
    memo.value = "";
    render();
  });

  sampleBtn.addEventListener("click", function () {
    mealType.value = "Lunch";
    calories.value = "540";
    protein.value = "24";
    menu.value = "Chicken salad bowl";
    memo.value = "High protein sample";
  });

  clearDataBtn.addEventListener("click", function () {
    localStorage.removeItem(KEY);
    render();
  });

  render();
})();
