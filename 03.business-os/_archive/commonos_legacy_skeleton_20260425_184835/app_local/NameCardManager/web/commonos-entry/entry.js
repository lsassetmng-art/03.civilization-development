(function () {
  var fallback = {
    appName: 'NameCardManager',
    commonComponentUsage: [
      'App Shell',
      'Card',
      'List',
      'Search Bar',
      'Filter Panel',
      'Status Chip',
      'Attachment UI',
      'Offline Queue Status UI',
      'Sync Retry UI',
      'Conflict Review UI'
    ],
    variantUsage: [
      'card.record',
      'panel.sync',
      'panel.conflict',
      'input.default',
      'button.primary'
    ],
    queueBoundary: {
      presentationOwner: 'CommonOS',
      businessMeaningOwner: 'NameCardManager'
    }
  };

  function render(config) {
    var usage = document.getElementById('componentUsage');
    var variants = document.getElementById('variantUsage');
    var queue = document.getElementById('queueBoundary');

    if (usage) {
      usage.innerHTML = '<div class="entry-list">' + config.commonComponentUsage.map(function (item) {
        return '<div class="entry-card"><strong>' + item + '</strong></div>';
      }).join('') + '</div>';
    }

    if (variants) {
      variants.innerHTML = '<div class="entry-list">' + config.variantUsage.map(function (item) {
        return '<div class="entry-card"><strong>' + item + '</strong></div>';
      }).join('') + '</div>';
    }

    if (queue) {
      queue.innerHTML = '<div class="entry-card">'
        + '<strong>presentation owner: ' + config.queueBoundary.presentationOwner + '</strong>'
        + '<div class="entry-meta">business meaning owner: ' + config.queueBoundary.businessMeaningOwner + '</div>'
        + '</div>';
    }
  }

  fetch('entry-manifest.json')
    .then(function (response) { return response.json(); })
    .then(render)
    .catch(function () { render(fallback); });
})();
