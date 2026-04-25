(function () {
  var apps = [
    "BodyMetrics",
    "MealPlanner",
    "TrainingCoach",
    "MoneyPlanner",
    "CareerLaunch",
    "LifePlanner",
    "EndOfLifePlanner",
    "InheritanceSupport",
    "LegalSupport",
    "BusinessLegalSupport"
  ];

  function waveOf(app) {
    if (["BodyMetrics", "MealPlanner", "TrainingCoach", "MoneyPlanner", "CareerLaunch"].indexOf(app) >= 0) return "Wave 1";
    if (["LifePlanner", "EndOfLifePlanner", "InheritanceSupport"].indexOf(app) >= 0) return "Wave 2";
    return "Wave 3";
  }

  function esc(str) {
    return String(str == null ? "" : str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function renderCard(app) {
    var wave = waveOf(app);
    var webPath = "../" + app + "/app-web/index.html";
    var androidPath = "/data/data/com.termux/files/home/03.civilization-development/04.life-os/" + app + "/app-android";
    var iphonePath = "/data/data/com.termux/files/home/03.civilization-development/04.life-os/" + app + "/app-iphone/" + app;

    return (
      '<div class="card">' +
        '<h3>' + esc(app) + '</h3>' +
        '<div class="status-chip">' + esc(wave) + '</div>' +
        '<div class="sub" style="margin-top:12px;">CommonOS consumer / LifeOS app implementation</div>' +
        '<div class="toolbar" style="margin-top:12px;">' +
          '<a class="small-link" href="' + esc(webPath) + '">Open Web</a>' +
        '</div>' +
        '<div class="sub" style="margin-top:12px;">Android Studio import:</div>' +
        '<div class="state-loading">' + esc(androidPath) + '</div>' +
        '<div class="sub" style="margin-top:12px;">Xcode import:</div>' +
        '<div class="state-loading">' + esc(iphonePath) + '</div>' +
      '</div>'
    );
  }

  var mount = document.getElementById("platformLauncherGrid");
  if (mount) {
    mount.innerHTML = apps.map(renderCard).join("");
  }
})();
