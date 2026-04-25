(function () {
  const C = window.LifeWebCommon;
  const KEY = "lifeos_trainingcoach_records";

  C.mountPersonaBackground("trainingcoach");

  document.getElementById("formArea").innerHTML = `
    <div class="row">
      <div>
        <label>Date</label>
        <input id="date" type="date">
      </div>
      <div>
        <label>Category</label>
        <select id="category">
          <option>Cardio</option>
          <option>Strength</option>
          <option>Mobility</option>
          <option>Recovery</option>
        </select>
      </div>
      <div>
        <label>Minutes</label>
        <input id="minutes" type="number" step="1" placeholder="45">
      </div>
      <div>
        <label>Intensity</label>
        <select id="intensity">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
    </div>
    <div class="full">
      <label>Workout</label>
      <input id="workout" type="text" placeholder="Full body circuit">
    </div>
    <div class="full">
      <label>Memo</label>
      <textarea id="memo" placeholder="How it felt"></textarea>
    </div>
    <div class="actions">
      <button id="saveBtn">Save Workout</button>
      <button id="sampleBtn" class="secondary">Insert Sample</button>
    </div>
  `;

  const date = document.getElementById("date");
  const category = document.getElementById("category");
  const minutes = document.getElementById("minutes");
  const intensity = document.getElementById("intensity");
  const workout = document.getElementById("workout");
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
    const weeklyMinutes = C.sum(items.slice(0, 7).map(x => Number(x.minutes || 0)));
    const highCount = items.filter(x => x.intensity === "High").length;
    const cardioCount = items.filter(x => x.category === "Cardio").length;

    summary.innerHTML = `
      <div class="metric">
        <div class="label">Sessions</div>
        <div class="value">${items.length}</div>
      </div>
      <div class="metric">
        <div class="label">Recent Minutes</div>
        <div class="value">${weeklyMinutes}</div>
      </div>
      <div class="metric">
        <div class="label">High Intensity</div>
        <div class="value">${highCount}</div>
      </div>
      <div class="metric">
        <div class="label">Cardio Sessions</div>
        <div class="value">${cardioCount}</div>
      </div>
    `;
  }

  function renderList(items) {
    if (!items.length) {
      records.innerHTML = `<div class="empty">No workouts yet</div>`;
      return;
    }

    records.innerHTML = items.map(item => `
      <div class="item">
        <div class="head">
          <span>${C.esc(item.date)} / ${C.esc(item.category)}</span>
          <span>${C.esc(item.minutes)} min</span>
        </div>
        <div class="sub">${C.esc(item.workout)} / ${C.esc(item.intensity)}
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
      category: category.value,
      minutes: minutes.value || "",
      intensity: intensity.value,
      workout: workout.value.trim(),
      memo: memo.value.trim()
    });
    write(items);
    minutes.value = "";
    workout.value = "";
    memo.value = "";
    render();
  });

  sampleBtn.addEventListener("click", function () {
    category.value = "Strength";
    minutes.value = "45";
    intensity.value = "Medium";
    workout.value = "Full body circuit";
    memo.value = "Sample training session";
  });

  clearDataBtn.addEventListener("click", function () {
    localStorage.removeItem(KEY);
    render();
  });

  render();
})();
