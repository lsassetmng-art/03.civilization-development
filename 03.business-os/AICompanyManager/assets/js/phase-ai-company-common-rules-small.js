(function () {
  "use strict";

  function replaceTextOnce() {
    var walker;
    var nodes = [];
    var node;

    if (!document.body) return;

    walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

    while ((node = walker.nextNode())) {
      nodes.push(node);
    }

    nodes.forEach(function (n) {
      n.nodeValue = n.nodeValue
        .replace(/会社規約/g, "会社共通ルール")
        .replace(/会社ルール/g, "会社共通ルール")
        .replace(/会社統一ルール/g, "会社共通ルール")
        .replace(/設計開発規約/g, "会社共通ルール")
        .replace(/設計開発ルール/g, "会社共通ルール");
    });
  }

  function hideSeparatedRuleCards() {
    var cards = document.querySelectorAll(".aicm-card");
    var i;
    var text;

    for (i = 0; i < cards.length; i += 1) {
      text = cards[i].textContent || "";

      if (
        text.indexOf("会社共通ルール") >= 0 &&
        text.indexOf("廃止") < 0
      ) {
        continue;
      }

      if (
        text.indexOf("設計開発規約") >= 0 ||
        text.indexOf("設計開発ルール") >= 0
      ) {
        cards[i].style.display = "none";
      }
    }
  }

  function applySmallCorrection() {
    replaceTextOnce();
    hideSeparatedRuleCards();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var delays = [0, 300, 1000, 2500];

    delays.forEach(function (delay) {
      window.setTimeout(applySmallCorrection, delay);
    });
  });

  window.AICM_COMPANY_COMMON_RULES_SMALL = {
    apply: applySmallCorrection
  };
})();
