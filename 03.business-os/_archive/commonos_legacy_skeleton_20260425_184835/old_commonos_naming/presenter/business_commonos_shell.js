window.BusinessOSCommonOSShell = {
  applyTheme: function (theme) {
    if (!theme || !document || !document.documentElement) return;
    document.documentElement.style.setProperty('--bg', theme.colorBg || '#f5f6f8');
    document.documentElement.style.setProperty('--surface', theme.colorSurface || '#ffffff');
    document.documentElement.style.setProperty('--border', theme.colorBorder || '#d9dee5');
    document.documentElement.style.setProperty('--muted', theme.colorMuted || '#5b6572');
    document.documentElement.style.setProperty('--radius-panel', theme.radiusPanel || '16px');
    document.documentElement.style.setProperty('--radius-card', theme.radiusCard || '12px');
    document.documentElement.style.setProperty('--spacing-base', theme.spacingBase || '16px');
    document.documentElement.style.setProperty('--spacing-large', theme.spacingLarge || '24px');
    document.documentElement.style.setProperty('--shadow-card', theme.shadowCard || '0 8px 24px rgba(0,0,0,0.08)');
  },

  render: function (rootId, viewModel) {
    var root = document.getElementById(rootId);
    if (!root) return;

    root.innerHTML = ''
      + '<main class="business-commonos-shell">'
      + '  <header class="business-commonos-header">'
      + '    <h1>' + viewModel.appName + '</h1>'
      + '    <p>' + viewModel.headline + '</p>'
      + '  </header>'
      + '  <section class="business-commonos-panel">'
      + '    <h2>Sections</h2>'
      + '    <div class="business-commonos-list">' + (viewModel.sections || []).map(function (item) {
            return '<div class="business-commonos-card"><strong>' + item.title + '</strong><div class="business-commonos-meta">' + item.summary + '</div></div>';
          }).join('') + '</div>'
      + '  </section>'
      + '  <section class="business-commonos-panel">'
      + '    <h2>Common Component Usage</h2>'
      + '    <div class="business-commonos-list">' + (viewModel.commonComponentUsage || []).map(function (item) {
            return '<div class="business-commonos-card"><strong>' + item + '</strong></div>';
          }).join('') + '</div>'
      + '  </section>'
      + '  <section class="business-commonos-panel">'
      + '    <h2>Variant Usage</h2>'
      + '    <div class="business-commonos-list">' + (viewModel.variantUsage || []).map(function (item) {
            return '<div class="business-commonos-card"><strong>' + item + '</strong></div>';
          }).join('') + '</div>'
      + '  </section>'
      + '  <section class="business-commonos-panel business-commonos-panel-wide">'
      + '    <h2>Sync Presentation</h2>'
      + '    <div class="business-commonos-card">'
      + '      <strong>mode: ' + viewModel.syncMode + '</strong>'
      + '      <div class="business-commonos-meta">presentation owner: ' + viewModel.presentationOwner + '</div>'
      + '      <div class="business-commonos-meta">business meaning owner: ' + viewModel.businessMeaningOwner + '</div>'
      + '      <div class="business-commonos-meta">triggers: ' + (viewModel.syncTriggers || []).join(', ') + '</div>'
      + '      <div class="business-commonos-meta">queue states: ' + (viewModel.queueStates || []).join(', ') + '</div>'
      + '    </div>'
      + '  </section>'
      + '</main>';
  }
};
