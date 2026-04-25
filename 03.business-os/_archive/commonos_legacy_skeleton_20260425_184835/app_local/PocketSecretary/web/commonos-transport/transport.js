(function () {
  var fallback = {
    appName: 'PocketSecretary',
    requestIdField: 'requestId',
    traceIdField: 'traceId',
    syncStatusField: 'syncStatus',
    clientTimestampField: 'clientTimestamp',
    serverTimestampField: 'serverTimestamp',
    paginationEnvelope: {
      itemsField: 'items',
      nextPageTokenField: 'nextPageToken',
      totalCountField: 'totalCount'
    },
    errorEnvelope: {
      errorCodeField: 'errorCode',
      errorMessageField: 'errorMessage',
      errorDetailsField: 'errorDetails'
    }
  };

  function render(config) {
    var requestTrace = document.getElementById('requestTrace');
    var paginationEnvelope = document.getElementById('paginationEnvelope');
    var errorEnvelope = document.getElementById('errorEnvelope');
    var syncStatusNaming = document.getElementById('syncStatusNaming');

    if (requestTrace) {
      requestTrace.innerHTML = ''
        + '<div class="transport-card">'
        + '<strong>requestId: ' + config.requestIdField + '</strong>'
        + '<div class="transport-meta">traceId: ' + config.traceIdField + '</div>'
        + '</div>';
    }

    if (paginationEnvelope) {
      paginationEnvelope.innerHTML = ''
        + '<div class="transport-card">'
        + '<strong>items: ' + config.paginationEnvelope.itemsField + '</strong>'
        + '<div class="transport-meta">nextPageToken: ' + config.paginationEnvelope.nextPageTokenField + '</div>'
        + '<div class="transport-meta">totalCount: ' + config.paginationEnvelope.totalCountField + '</div>'
        + '</div>';
    }

    if (errorEnvelope) {
      errorEnvelope.innerHTML = ''
        + '<div class="transport-card">'
        + '<strong>errorCode: ' + config.errorEnvelope.errorCodeField + '</strong>'
        + '<div class="transport-meta">errorMessage: ' + config.errorEnvelope.errorMessageField + '</div>'
        + '<div class="transport-meta">errorDetails: ' + config.errorEnvelope.errorDetailsField + '</div>'
        + '</div>';
    }

    if (syncStatusNaming) {
      syncStatusNaming.innerHTML = ''
        + '<div class="transport-card">'
        + '<strong>syncStatus: ' + config.syncStatusField + '</strong>'
        + '<div class="transport-meta">clientTimestamp: ' + config.clientTimestampField + '</div>'
        + '<div class="transport-meta">serverTimestamp: ' + config.serverTimestampField + '</div>'
        + '</div>';
    }
  }

  fetch('transport-manifest.json')
    .then(function (response) { return response.json(); })
    .then(render)
    .catch(function () { render(fallback); });
})();
