(function () {
  window.LifeCommonOSTheme = {
    providerRoot: "/data/data/com.termux/files/home/03.civilization-development/12.common-os",
    consumerRoot: "/data/data/com.termux/files/home/03.civilization-development/04.life-os/_commonos",
    consumerOS: "04.life-os",
    variants: {
      shell: "life.standard",
      buttonPrimary: "button.primary",
      buttonSecondary: "button.secondary",
      input: "input.default",
      card: "card.standard",
      syncPanel: "panel.sync",
      conflictPanel: "panel.conflict"
    },
    queueStateClass: function (state) {
      if (state === "failed" || state === "conflict") return "status-chip warn";
      if (state === "sent") return "status-chip ok";
      return "status-chip";
    }
  };
})();
