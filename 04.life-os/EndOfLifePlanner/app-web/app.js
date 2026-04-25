(function () {
  const appKey = "endoflifeplanner";
  const hero = document.getElementById("hero");
  const personaName = document.getElementById("personaName");
  const backgroundSelect = document.getElementById("backgroundSelect");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const statusLine = document.getElementById("statusLine");

  const backgrounds = {
    sunrise: "linear-gradient(135deg, #f59e0b, #ef4444)",
    forest: "linear-gradient(135deg, #10b981, #065f46)",
    night: "linear-gradient(135deg, #312e81, #0f172a)"
  };

  function load() {
    const raw = localStorage.getItem("lifeos_" + appKey);
    const state = raw ? JSON.parse(raw) : { personaName: "", background: "sunrise" };
    personaName.value = state.personaName || "";
    backgroundSelect.value = state.background || "sunrise";
    applyBackground();
    statusLine.textContent = state.personaName
      ? "Saved persona: " + state.personaName
      : "No persona saved yet";
  }

  function save() {
    const state = {
      personaName: personaName.value.trim(),
      background: backgroundSelect.value
    };
    localStorage.setItem("lifeos_" + appKey, JSON.stringify(state));
    applyBackground();
    statusLine.textContent = state.personaName
      ? "Saved persona: " + state.personaName
      : "Saved without persona name";
  }

  function reset() {
    localStorage.removeItem("lifeos_" + appKey);
    personaName.value = "";
    backgroundSelect.value = "sunrise";
    applyBackground();
    statusLine.textContent = "Reset completed";
  }

  function applyBackground() {
    hero.style.background = backgrounds[backgroundSelect.value] || backgrounds.sunrise;
  }

  saveBtn.addEventListener("click", save);
  resetBtn.addEventListener("click", reset);
  backgroundSelect.addEventListener("change", applyBackground);

  load();
})();
