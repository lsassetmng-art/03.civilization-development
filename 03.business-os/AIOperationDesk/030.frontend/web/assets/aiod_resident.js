function bindQuickActionButtons() {
  const buttons = document.querySelectorAll("[data-stub-action]");
  const output = document.getElementById("residentActionOutput");

  if (!output) {
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-stub-action") || "unknown";
      output.textContent = `stub resident action selected: ${action}`;
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  bindQuickActionButtons();
});
