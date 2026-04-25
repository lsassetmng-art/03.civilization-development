(function () {
  var state = {
    appName: 'PocketSecretary',
    briefing: [
      { title: 'Morning overview ready', urgency: 'normal', note: '2 meetings and 4 actions pending' },
      { title: 'One overdue follow-up', urgency: 'high', note: 'Client callback overdue' }
    ],
    queue: [
      { title: 'Prepare reply draft', state: 'pending', due: '2026-04-16 10:00' },
      { title: 'Confirm schedule update', state: 'overdue', due: '2026-04-15 18:00' }
    ],
    actions: [
      { title: 'Create meeting follow-up', type: 'conversation_action', queue: 'queued' },
      { title: 'Summarize call outcome', type: 'briefing_input', queue: 'not_queued' }
    ],
    summary: {
      headline: 'Today has 2 high-attention items.',
      detail: 'Runtime dashboard summary shell.'
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

  renderList('dailyBriefing', state.briefing, function (item) {
    return ''
      + '<div class="card">'
      + '<strong>' + item.title + '</strong>'
      + '<div class="meta">urgency: ' + item.urgency + '</div>'
      + '<div>' + item.note + '</div>'
      + '</div>';
  });

  renderList('followThroughQueue', state.queue, function (item) {
    return ''
      + '<div class="card">'
      + '<strong>' + item.title + '</strong>'
      + '<div class="meta">state: ' + item.state + ' / due: ' + item.due + '</div>'
      + '</div>';
  });

  renderList('conversationActions', state.actions, function (item) {
    return ''
      + '<div class="card">'
      + '<strong>' + item.title + '</strong>'
      + '<div class="meta">type: ' + item.type + ' / queue: ' + item.queue + '</div>'
      + '</div>';
  });

  var summaryBlock = document.getElementById('summaryBlock');
  if (summaryBlock) {
    summaryBlock.innerHTML = ''
      + '<div class="card">'
      + '<strong>' + state.summary.headline + '</strong>'
      + '<div class="meta">' + state.summary.detail + '</div>'
      + '</div>';
  }
})();
