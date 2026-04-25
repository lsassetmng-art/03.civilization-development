(function () {
  var fallback = {
    appName: 'PocketSecretary',
    syncPolicy: {
      mode: 'offline-first',
      localQueue: true,
      onlineSync: true,
      triggers: ['app_launch', 'foreground_resume', 'online_recovery', 'manual_sync', 'send_possible']
    },
    retryPolicy: {
      visualOwner: 'CommonOS',
      states: ['retry_wait', 'failed', 'processing']
    },
    queueVisualRule: {
      presentationOwner: 'CommonOS',
      businessMeaningOwner: 'PocketSecretary'
    },
    clientCapabilityRegistry: ['file_picker', 'offline_storage', 'share_sheet', 'push_notification'],
    accessibilityPreset: ['large_touch_target', 'screen_reader_label_rule', 'contrast_safe_default']
  };

  function listHtml(items) {
    return '<div class="contract-list">' + items.map(function (item) {
      return '<div class="contract-card"><strong>' + item + '</strong></div>';
    }).join('') + '</div>';
  }

  function render(config) {
    var syncRetry = document.getElementById('syncRetry');
    var queueVisual = document.getElementById('queueVisual');
    var clientCapabilities = document.getElementById('clientCapabilities');
    var accessibility = document.getElementById('accessibility');

    if (syncRetry) {
      syncRetry.innerHTML = ''
        + '<div class="contract-card">'
        + '<strong>mode: ' + config.syncPolicy.mode + '</strong>'
        + '<div class="contract-meta">localQueue=' + config.syncPolicy.localQueue + ' / onlineSync=' + config.syncPolicy.onlineSync + '</div>'
        + '<div class="contract-meta">triggers: ' + config.syncPolicy.triggers.join(', ') + '</div>'
        + '<div class="contract-meta">retry visual owner: ' + config.retryPolicy.visualOwner + '</div>'
        + '<div class="contract-meta">retry states: ' + config.retryPolicy.states.join(', ') + '</div>'
        + '</div>';
    }

    if (queueVisual) {
      queueVisual.innerHTML = ''
        + '<div class="contract-card">'
        + '<strong>presentation owner: ' + config.queueVisualRule.presentationOwner + '</strong>'
        + '<div class="contract-meta">business meaning owner: ' + config.queueVisualRule.businessMeaningOwner + '</div>'
        + '</div>';
    }

    if (clientCapabilities) {
      clientCapabilities.innerHTML = listHtml(config.clientCapabilityRegistry);
    }

    if (accessibility) {
      accessibility.innerHTML = listHtml(config.accessibilityPreset);
    }
  }

  fetch('contract-manifest.json')
    .then(function (response) { return response.json(); })
    .then(render)
    .catch(function () { render(fallback); });
})();
