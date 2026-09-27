(function (global) {
  'use strict';

  function requireBridge() {
    var bridge = global.BusinessOSCommonOSProviderBridge;

    if (!bridge || typeof bridge.requireProvider !== 'function') {
      throw new Error('BusinessOS CommonOS provider bridge is required');
    }

    return bridge;
  }

  /* R17B_THEME_SEMANTIC_BRIDGE
   * BusinessOS retains its domain theme contract while CommonOS owns
   * shared presentation. Values are mapped by semantic role, never by
   * coincidental literal-value equality.
   */
  function applyTheme(theme) {
    var root = document.documentElement;
    var values = theme || {};

    var mapping = {
      colorBg: ['--businessos-bg', '--cos-color-bg'],
      colorSurface: ['--businessos-surface', '--cos-color-surface'],
      colorBorder: ['--businessos-border', '--cos-color-border'],
      colorMuted: ['--businessos-muted', '--cos-color-text-muted'],
      colorText: ['--businessos-text', '--cos-color-text'],
      radiusCard: ['--businessos-radius-card', '--cos-radius-md'],
      radiusPanel: ['--businessos-radius-panel', '--cos-radius-lg'],
      shadowCard: ['--businessos-shadow-card', '--cos-shadow-md'],
      spacingBase: ['--businessos-spacing-base', '--cos-space-4'],
      spacingLarge: ['--businessos-spacing-large', '--cos-space-6'],
      density: ['--businessos-density']
    };

    Object.keys(mapping).forEach(function(key) {
      var value = values[key];

      if (value === undefined || value === null || value === '') {
        return;
      }

      mapping[key].forEach(function(customProperty) {
        root.style.setProperty(customProperty, String(value));
      });
    });
  }

  function scalarText(value) {
    if (value === null || typeof value === 'undefined') {
      return '';
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value);
    }

    return '';
  }

  function objectSummary(value) {
    if (!value || typeof value !== 'object') {
      return scalarText(value);
    }

    return Object.keys(value)
      .filter(function (key) {
        var current = value[key];

        return (
          typeof current === 'string' ||
          typeof current === 'number' ||
          typeof current === 'boolean'
        );
      })
      .map(function (key) {
        return key + ': ' + String(value[key]);
      })
      .join(' / ');
  }

  function itemNode(rt, item) {
    if (
      item &&
      typeof Node !== 'undefined' &&
      item instanceof Node
    ) {
      return item;
    }

    return rt.el('li', {
      textContent: objectSummary(item)
    });
  }

  function arrayNode(rt, values) {
    return rt.el(
      'ul',
      { className: 'businessos-commonos-domain-list' },
      (values || []).map(function (item) {
        return itemNode(rt, item);
      })
    );
  }

  function sectionBody(rt, section) {
    var source = section || {};

    if (
      source.body &&
      typeof Node !== 'undefined' &&
      source.body instanceof Node
    ) {
      return source.body;
    }

    var arrayCandidate =
      Array.isArray(source.items) ? source.items :
      Array.isArray(source.entries) ? source.entries :
      Array.isArray(source.values) ? source.values :
      Array.isArray(source.cards) ? source.cards :
      null;

    if (arrayCandidate) {
      return arrayNode(rt, arrayCandidate);
    }

    var textCandidate =
      scalarText(source.body) ||
      scalarText(source.copy) ||
      scalarText(source.description) ||
      scalarText(source.text);

    if (textCandidate) {
      return rt.el('p', {
        className: 'businessos-commonos-domain-copy',
        textContent: textCandidate
      });
    }

    return rt.el('p', {
      className: 'businessos-commonos-domain-copy',
      textContent: objectSummary(source)
    });
  }

  function domainSections(rt, viewModel) {
    return (viewModel.sections || []).map(function (section) {
      return {
        title: section.title || section.label || 'Section',
        body: sectionBody(rt, section)
      };
    });
  }

  function syncEntries(provider, viewModel) {
    var supported = provider.sync.STATES || [];

    return (viewModel.queueStates || [])
      .filter(function (state) {
        return supported.indexOf(state) !== -1;
      })
      .map(function (state) {
        return {
          state: state,
          title: 'Queue: ' + state,
          subtitle: viewModel.syncMode || 'offline-first',
          count: 0
        };
      });
  }

  function buildSections(provider, viewModel) {
    var sections = domainSections(provider.runtime, viewModel);
    var queueEntries = syncEntries(provider, viewModel);

    if (queueEntries.length) {
      sections.push({
        title: 'Synchronization',
        body: provider.sync.queueGrid(queueEntries)
      });
    }

    return sections;
  }

  function buildNavItems(sections) {
    return sections.map(function (section, index) {
      return {
        label: section.title || ('Section ' + String(index + 1)),
        href: '#',
        current: index === 0
      };
    });
  }

  function clearRoot(root) {
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
  }

  function render(rootId, viewModel) {
    var root = document.getElementById(rootId);

    if (!root) {
      throw new Error(
        'BusinessOS CommonOS root not found: ' + rootId
      );
    }

    var bridge = requireBridge();
    var provider = bridge.requireProvider();
    var model = viewModel || {};
    var sections = buildSections(provider, model);

    var shellNode = provider.shell.createShell({
      title: model.appName || 'BusinessOS',
      subtitle:
        (model.providerRole || 'shared_provider') +
        ' / ' +
        (model.consumerRole || 'os_side_consumer'),
      navItems: buildNavItems(sections),
      heroTitle:
        model.headline ||
        model.appName ||
        'BusinessOS',
      heroCopy:
        'UI: ' +
        (model.uiOwner || 'CommonOS') +
        ' / Business meaning: ' +
        (model.businessOwner || 'BusinessOS'),
      sections: sections
    });

    clearRoot(root);
    root.appendChild(shellNode);

    root.setAttribute(
      'data-commonos-provider-connected',
      'true'
    );

    return shellNode;
  }

  global.BusinessOSCommonOSShell = {
    applyTheme: applyTheme,
    render: render
  };
})(window);
