async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`${url} -> ${res.status}`);
  }
  return res.json();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderHealth(data) {
  const box = document.getElementById("healthBox");
  box.innerHTML = `
    <div><strong>OK:</strong> ${escapeHtml(String(data.ok))}</div>
    <div><strong>Name:</strong> ${escapeHtml(data.name)}</div>
    <div><strong>Version:</strong> ${escapeHtml(data.version)}</div>
    <div><strong>UTC:</strong> ${escapeHtml(data.timestamp_utc)}</div>
  `;
}

function renderSystem(data) {
  const system = data.system;
  const box = document.getElementById("systemBox");
  box.innerHTML = `
    <div class="kv-row"><span>Name</span><strong>${escapeHtml(system.name)}</strong></div>
    <div class="kv-row"><span>Version</span><strong>${escapeHtml(system.version)}</strong></div>
    <div class="kv-row"><span>Runtime</span><strong>${escapeHtml(system.runtime)}</strong></div>
    <div class="kv-row"><span>Environment</span><strong>${escapeHtml(system.environment)}</strong></div>
    <div class="kv-row"><span>Data Dir</span><strong>${escapeHtml(system.data_dir)}</strong></div>
  `;
}

function renderModules(data) {
  const box = document.getElementById("modulesBox");
  box.innerHTML = data.modules.map(module => `
    <article class="card">
      <div class="card__top">
        <h3>${escapeHtml(module.name)}</h3>
        <span class="badge">${escapeHtml(module.status)}</span>
      </div>
      <div class="muted">${escapeHtml(module.id)}</div>
      <p>${escapeHtml(module.description)}</p>
    </article>
  `).join("");
}

async function loadAll() {
  const health = await fetchJson("/api/health");
  const system = await fetchJson("/api/system");
  const modules = await fetchJson("/api/modules");

  renderHealth(health);
  renderSystem(system);
  renderModules(modules);
}

document.getElementById("reloadButton").addEventListener("click", async () => {
  const button = document.getElementById("reloadButton");
  button.disabled = true;
  button.textContent = "Reloading...";
  try {
    await loadAll();
  } catch (err) {
    alert(err.message);
  } finally {
    button.disabled = false;
    button.textContent = "Reload";
  }
});

loadAll().catch(err => {
  document.getElementById("healthBox").textContent = err.message;
});
