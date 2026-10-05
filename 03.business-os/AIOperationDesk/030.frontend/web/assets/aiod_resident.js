function requireResidentUi() {
  const ui = window.AIODCommonOSResident;

  if (!ui || typeof ui.mount !== "function") {
    throw new Error(
      "AI Operation Desk CommonOS resident helper is required"
    );
  }

  return ui;
}

function bindQuickActionButtons() {
  const ui = requireResidentUi();

  ui.mount();

  ui.bindStubActions((action) => {
    ui.setOutput(
      `stub resident action selected: ${action}`
    );
  });
}

window.addEventListener("DOMContentLoaded", () => {
  bindQuickActionButtons();
});
