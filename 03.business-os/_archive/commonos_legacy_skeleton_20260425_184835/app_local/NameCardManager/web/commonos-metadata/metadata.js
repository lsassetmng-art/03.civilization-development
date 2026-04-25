(function () {
  var fallback = {
    appName: 'NameCardManager',
    localeKeys: [
      'name_card_manager.capture.title',
      'name_card_manager.relationships.title',
      'name_card_manager.company_timeline.title'
    ],
    screenTemplates: [
      'list_detail_standard',
      'record_card_grid',
      'search_filter_detail'
    ],
    helpTemplates: [
      'capture_help_template',
      'relationship_merge_help_template'
    ],
    notificationTemplates: [
      'capture_review_required',
      'relationship_merge_pending'
    ],
    attachmentPolicy: {
      temporaryHolding: 'local_storage',
      previewShell: 'CommonOS Attachment UI',
      allowedKinds: ['image', 'pdf']
    },
    exportTemplates: [
      'contact_export_csv',
      'company_timeline_export_pdf'
    ]
  };

  function listHtml(items) {
    return '<div class="metadata-list">' + items.map(function (item) {
      return '<div class="metadata-card"><strong>' + item + '</strong></div>';
    }).join('') + '</div>';
  }

  function render(config) {
    var localeKeys = document.getElementById('localeKeys');
    var screenTemplates = document.getElementById('screenTemplates');
    var helpNotification = document.getElementById('helpNotification');
    var attachmentExport = document.getElementById('attachmentExport');

    if (localeKeys) {
      localeKeys.innerHTML = listHtml(config.localeKeys);
    }

    if (screenTemplates) {
      screenTemplates.innerHTML = listHtml(config.screenTemplates);
    }

    if (helpNotification) {
      helpNotification.innerHTML = listHtml(config.helpTemplates.concat(config.notificationTemplates));
    }

    if (attachmentExport) {
      attachmentExport.innerHTML = ''
        + '<div class="metadata-card">'
        + '<strong>temporaryHolding: ' + config.attachmentPolicy.temporaryHolding + '</strong>'
        + '<div class="metadata-meta">previewShell: ' + config.attachmentPolicy.previewShell + '</div>'
        + '<div class="metadata-meta">allowedKinds: ' + config.attachmentPolicy.allowedKinds.join(', ') + '</div>'
        + '<div class="metadata-meta">exports: ' + config.exportTemplates.join(', ') + '</div>'
        + '</div>';
    }
  }

  fetch('metadata-manifest.json')
    .then(function (response) { return response.json(); })
    .then(render)
    .catch(function () { render(fallback); });
})();
