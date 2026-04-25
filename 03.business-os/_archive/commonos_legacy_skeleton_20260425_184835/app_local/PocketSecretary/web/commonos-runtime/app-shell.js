(function () {
  var fallbackConfig = {
    appName: 'PocketSecretary',
    commonComponentUsage: [
      'Card',
      'List',
      'Search Bar',
      'Filter Panel',
      'Status Chip',
      'Toast',
      'Offline Queue Status UI',
      'Sync Retry UI',
      'Conflict Review UI',
      'App Shell'
    ],
    featureVariants: [
      'panel.sync',
      'panel.conflict',
      'input.compact',
      'button.primary',
      'card.standard'
    ],
    queuePresentation: {
      owner: 'CommonOS',
      businessMeaningOwner: 'PocketSecretary',
      states: ['pending', 'processing', 'retry_wait', 'sent', 'failed', 'cancelled', 'conflict']
    }
  };

  function render(config) {
    var usage = document.getElementById('componentUsage');
    var variants = document.getElementById('featureVariants');
    var queue = document.getElementById('queuePresentation');

    if (usage) {
      usage.innerHTML = '<div class="item-list">' + config.commonComponentUsage.map(function (item) {
        return '<div class="item-card"><strong>' + item + '</strong></div>';
      }).join('') + '</div>';
    }

    if (variants) {
      variants.innerHTML = '<div class="item-list">' + config.featureVariants.map(function (item) {
        return '<div class="item-card"><strong>' + item + '</strong></div>';
      }).join('') + '</div>';
    }

    if (queue) {
      queue.innerHTML = '<div class="item-card">'
        + '<strong>presentation owner: ' + config.queuePresentation.owner + '</strong>'
        + '<div class="item-meta">business meaning owner: ' + config.queuePresentation.businessMeaningOwner + '</div>'
        + '<div class="item-meta">states: ' + config.queuePresentation.states.join(', ') + '</div>'
        + '</div>';
    }
  }

  fetch('app-config.json')
    .then(function (response) { return response.json(); })
    .then(render)
    .catch(function () { render(fallbackConfig); });
})();
