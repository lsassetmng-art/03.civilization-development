window.BusinessOSCommonOSLaunchShell = {
  render: function (rootId, config) {
    var root = document.getElementById(rootId);
    if (!root) return;

    var routes = config.routes || {};
    var routeCards = Object.keys(routes).map(function (key) {
      return '<div class="launch-card"><strong>' + key + '</strong><div class="launch-meta">' + routes[key] + '</div></div>';
    }).join('');

    var summaryCards = (config.summary || []).map(function (item) {
      return '<div class="launch-card"><strong>' + item + '</strong></div>';
    }).join('');

    root.innerHTML = ''
      + '<main class="launch-shell">'
      + '  <header class="launch-header">'
      + '    <h1>' + config.appName + '</h1>'
      + '    <p>' + config.headline + '</p>'
      + '    <div class="launch-actions">'
      + '      <button class="launch-button launch-button-primary" id="openDefaultTarget">Open Default Target</button>'
      + '      <button class="launch-button" id="openConsumerTarget">Open Consumer</button>'
      + '    </div>'
      + '  </header>'
      + '  <section class="launch-panel">'
      + '    <h2>Launch Profile</h2>'
      + '    <div class="launch-card">'
      + '      <strong>ui owner: ' + config.uiOwner + '</strong>'
      + '      <div class="launch-meta">business owner: ' + config.businessOwner + '</div>'
      + '      <div class="launch-meta">default target: ' + config.defaultTarget + '</div>'
      + '    </div>'
      + '  </section>'
      + '  <section class="launch-panel">'
      + '    <h2>Connected Routes</h2>'
      + '    <div class="launch-list">' + routeCards + '</div>'
      + '  </section>'
      + '  <section class="launch-panel launch-panel-wide">'
      + '    <h2>Summary</h2>'
      + '    <div class="launch-list">' + summaryCards + '</div>'
      + '  </section>'
      + '</main>';

    var defaultButton = document.getElementById('openDefaultTarget');
    var consumerButton = document.getElementById('openConsumerTarget');

    if (defaultButton) {
      defaultButton.onclick = function () {
        window.location.href = config.defaultTarget;
      };
    }

    if (consumerButton && routes.consumer) {
      consumerButton.onclick = function () {
        window.location.href = routes.consumer;
      };
    }
  }
};
