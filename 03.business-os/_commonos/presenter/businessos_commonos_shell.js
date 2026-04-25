window.BusinessOSCommonOSShell = {
  applyTheme: function (theme) {
    if (!theme || !document || !document.documentElement) return;
    document.documentElement.style.setProperty('--businessos-bg', theme.colorBg || '#f5f6f8');
    document.documentElement.style.setProperty('--businessos-surface', theme.colorSurface || '#ffffff');
    document.documentElement.style.setProperty('--businessos-border', theme.colorBorder || '#d9dee5');
    document.documentElement.style.setProperty('--businessos-muted', theme.colorMuted || '#5b6572');
    document.documentElement.style.setProperty('--businessos-text', theme.colorText || '#1f2328');
    document.documentElement.style.setProperty('--businessos-radius-panel', theme.radiusPanel || '16px');
    document.documentElement.style.setProperty('--businessos-radius-card', theme.radiusCard || '12px');
    document.documentElement.style.setProperty('--businessos-spacing-base', theme.spacingBase || '16px');
    document.documentElement.style.setProperty('--businessos-spacing-large', theme.spacingLarge || '24px');
    document.documentElement.style.setProperty('--businessos-shadow-card', theme.shadowCard || '0 8px 24px rgba(0,0,0,0.08)');
  },

  cardList: function (items) {
    return '<div class="businessos-commonos-list">' + (items || []).map(function (item) {
      if (typeof item === 'string') {
        return '<div class="businessos-commonos-card"><strong>' + item + '</strong></div>';
      }
      return '<div class="businessos-commonos-card"><strong>' + item.title + '</strong><div class="businessos-commonos-meta">' + item.summary + '</div></div>';
    }).join('') + '</div>';
  },

  render: function (rootId, viewModel) {
    var root = document.getElementById(rootId);
    if (!root) return;

    root.innerHTML = ''
      + '<main class="businessos-commonos-shell">'
      + '  <header class="businessos-commonos-header">'
      + '    <h1>' + viewModel.appName + '</h1>'
      + '    <p>' + viewModel.headline + '</p>'
      + '    <div class="businessos-commonos-meta">providerRole=' + viewModel.providerRole + ' / consumerRole=' + viewModel.consumerRole + '</div>'
      + '    <div class="businessos-commonos-meta">uiOwner=' + viewModel.uiOwner + ' / businessOwner=' + viewModel.businessOwner + '</div>'
      + '  </header>'
      + '  <section class="businessos-commonos-panel">'
      + '    <h2>Sections</h2>'
      +      this.cardList(viewModel.sections)
      + '  </section>'
      + '  <section class="businessos-commonos-panel">'
      + '    <h2>Common Components</h2>'
      +      this.cardList(viewModel.commonComponentUsage)
      + '  </section>'
      + '  <section class="businessos-commonos-panel">'
      + '    <h2>Variants</h2>'
      +      this.cardList(viewModel.variantUsage)
      + '  </section>'
      + '  <section class="businessos-commonos-panel businessos-commonos-panel-wide">'
      + '    <h2>Sync Presentation</h2>'
      + '    <div class="businessos-commonos-card">'
      + '      <strong>mode: ' + viewModel.syncMode + '</strong>'
      + '      <div class="businessos-commonos-meta">triggers: ' + (viewModel.syncTriggers || []).join(', ') + '</div>'
      + '      <div class="businessos-commonos-meta">queue states: ' + (viewModel.queueStates || []).join(', ') + '</div>'
      + '    </div>'
      + '  </section>'
      + '</main>';
  }
};
