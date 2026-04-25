(function () {
  var state = {
    appName: 'NameCardManager',
    captureInbox: [
      { title: 'New card image received', status: 'staging_pending', owner: 'Boss' },
      { title: 'OCR review waiting', status: 'manual_review', owner: 'Boss' }
    ],
    relationships: [
      { label: 'Client Contact', strength: 'strong', evidence: 'manual_confirmation' },
      { label: 'Partner', strength: 'medium', evidence: 'timeline_inference' }
    ],
    companyTimeline: [
      { title: 'Kickoff Meeting', summary: 'Initial meeting completed', time: '2026-04-10' },
      { title: 'Proposal Follow-up', summary: 'Follow-up confirmed', time: '2026-04-14' }
    ],
    selectedCard: {
      personName: 'Sample Person',
      companyName: 'Sample Company',
      department: 'Sales',
      note: 'Runtime dashboard detail shell.'
    }
  };

  function renderList(targetId, items, builder) {
    var root = document.getElementById(targetId);
    if (!root) return;
    var html = '<div class="list">';
    for (var i = 0; i < items.length; i += 1) {
      html += builder(items[i]);
    }
    html += '</div>';
    root.innerHTML = html;
  }

  renderList('captureInbox', state.captureInbox, function (item) {
    return ''
      + '<div class="card">'
      + '<strong>' + item.title + '</strong>'
      + '<div class="meta">status: ' + item.status + ' / owner: ' + item.owner + '</div>'
      + '</div>';
  });

  renderList('relationshipSummary', state.relationships, function (item) {
    return ''
      + '<div class="card">'
      + '<strong>' + item.label + '</strong>'
      + '<div class="meta">strength: ' + item.strength + ' / evidence: ' + item.evidence + '</div>'
      + '</div>';
  });

  renderList('companyTimeline', state.companyTimeline, function (item) {
    return ''
      + '<div class="card">'
      + '<strong>' + item.title + '</strong>'
      + '<div>' + item.summary + '</div>'
      + '<div class="meta">time: ' + item.time + '</div>'
      + '</div>';
  });

  var selectedCard = document.getElementById('selectedCard');
  if (selectedCard) {
    selectedCard.innerHTML = ''
      + '<div class="card">'
      + '<strong>' + state.selectedCard.personName + '</strong>'
      + '<div>' + state.selectedCard.companyName + '</div>'
      + '<div class="meta">department: ' + state.selectedCard.department + '</div>'
      + '<div class="meta">note: ' + state.selectedCard.note + '</div>'
      + '</div>';
  }
})();
