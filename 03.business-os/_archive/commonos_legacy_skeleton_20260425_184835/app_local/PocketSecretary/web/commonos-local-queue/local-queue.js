(function () {
  var fallback = {
    appName: 'PocketSecretary',
    syncMode: 'offline-first',
    syncTriggers: ['app_launch', 'foreground_resume', 'online_recovery', 'manual_sync', 'send_possible'],
    retryStates: ['retry_wait', 'failed', 'processing'],
    queueKinds: ['briefing_refresh', 'follow_through_update', 'conversation_action_write'],
    storageStrategy: {
      uiAssets: 'cache',
      structuredState: 'indexeddb_equivalent',
      localOutbox: 'local_outbox_queue',
      temporaryAttachment: 'local_storage'
    }
  };

  function listHtml(items) {
    return '<div class="queue-list">' + items.map(function (item) {
      return '<div class="queue-card"><strong>' + item + '</strong></div>';
    }).join('') + '</div>';
  }

  function render(config) {
    var syncTriggers = document.getElementById('syncTriggers');
    var retryStates = document.getElementById('retryStates');
    var queueKinds = document.getElementById('queueKinds');
    var storageStrategy = document.getElementById('storageStrategy');

    if (syncTriggers) {
      syncTriggers.innerHTML = listHtml(config.syncTriggers);
    }

    if (retryStates) {
      retryStates.innerHTML = listHtml(config.retryStates);
    }

    if (queueKinds) {
      queueKinds.innerHTML = listHtml(config.queueKinds);
    }

    if (storageStrategy) {
      storageStrategy.innerHTML = ''
        + '<div class="queue-card">'
        + '<strong>sync mode: ' + config.syncMode + '</strong>'
        + '<div class="queue-meta">uiAssets: ' + config.storageStrategy.uiAssets + '</div>'
        + '<div class="queue-meta">structuredState: ' + config.storageStrategy.structuredState + '</div>'
        + '<div class="queue-meta">localOutbox: ' + config.storageStrategy.localOutbox + '</div>'
        + '<div class="queue-meta">temporaryAttachment: ' + config.storageStrategy.temporaryAttachment + '</div>'
        + '</div>';
    }
  }

  fetch('local-queue-manifest.json')
    .then(function (response) { return response.json(); })
    .then(render)
    .catch(function () { render(fallback); });
})();
