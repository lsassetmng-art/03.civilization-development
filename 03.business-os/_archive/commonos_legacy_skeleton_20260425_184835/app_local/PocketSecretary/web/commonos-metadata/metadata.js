(function () {
  var fallback = {
    appName: 'PocketSecretary',
    localeKeys: [
      'pocket_secretary.briefing.title',
      'pocket_secretary.follow_through_queue.title',
      'pocket_secretary.conversation_actions.title'
    ],
    screenTemplates: [
      'briefing_dashboard_standard',
      'queue_detail_standard',
      'action_capture_flow'
    ],
    helpTemplates: [
      'briefing_help_template',
      'queue_retry_help_template'
    ],
    notificationTemplates: [
      'briefing_ready_notice',
      'follow_through_retry_required'
    ],
    attachmentPolicy: {
      temporaryHolding: 'local_storage',
      previewShell: 'CommonOS Attachment UI',
      allowedKinds: ['image', 'pdf', 'text']
    },
    exportTemplates: [
      'briefing_export_pdf',
      'action_summary_export_csv'
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
