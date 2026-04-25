(function () {
  var fallback = {
    appName: 'NameCardManager',
    launchProfile: {
      mode: 'commonos_bootstrap',
      uiOwner: 'CommonOS',
      businessCanonOwner: 'NameCardManager'
    },
    runtimeRoute: '../commonos-runtime/index.html',
    entryRoute: '../commonos-entry/index.html',
    contractRoute: '../commonos-contract/index.html',
    summary: [
      'CommonOS owns shared UI foundation',
      'NameCardManager owns business meaning',
      'Bootstrap bridges runtime, entry, and contract layers'
    ]
  };

  function render(config) {
    var launchProfile = document.getElementById('launchProfile');
    var connectedRoutes = document.getElementById('connectedRoutes');
    var bootstrapSummary = document.getElementById('bootstrapSummary');

    if (launchProfile) {
      launchProfile.innerHTML = ''
        + '<div class="bootstrap-card">'
        + '<strong>mode: ' + config.launchProfile.mode + '</strong>'
        + '<div class="bootstrap-meta">ui owner: ' + config.launchProfile.uiOwner + '</div>'
        + '<div class="bootstrap-meta">business canon owner: ' + config.launchProfile.businessCanonOwner + '</div>'
        + '</div>';
    }

    if (connectedRoutes) {
      connectedRoutes.innerHTML = ''
        + '<div class="bootstrap-list">'
        + '<div class="bootstrap-card"><strong>runtime</strong><div class="bootstrap-meta">' + config.runtimeRoute + '</div></div>'
        + '<div class="bootstrap-card"><strong>entry</strong><div class="bootstrap-meta">' + config.entryRoute + '</div></div>'
        + '<div class="bootstrap-card"><strong>contract</strong><div class="bootstrap-meta">' + config.contractRoute + '</div></div>'
        + '</div>';
    }

    if (bootstrapSummary) {
      bootstrapSummary.innerHTML = '<div class="bootstrap-list">' + config.summary.map(function (item) {
        return '<div class="bootstrap-card"><strong>' + item + '</strong></div>';
      }).join('') + '</div>';
    }
  }

  fetch('bootstrap-manifest.json')
    .then(function (response) { return response.json(); })
    .then(render)
    .catch(function () { render(fallback); });
})();
