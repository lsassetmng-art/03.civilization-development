window.BusinessOSCommonOSProviderBridge = {
  providerRole: 'shared_provider',
  consumerRole: 'os_side_consumer',
  providerRoot: '~/03.civilization-development/12.common-os',
  consumerRoot: '~/03.civilization-development/03.business-os/_commonos',
  providerModules: [
    'CommonTokenSet',
    'CommonUIRuntime',
    'CommonShell',
    'CommonSyncPresentation',
    'AppCommonStarter'
  ],
  sharedScopes: [
    'shell',
    'list',
    'detail',
    'form',
    'sync_presentation'
  ],
  forbiddenScopes: [
    'business_canon',
    'api_payload_canon',
    'pricing_canon',
    'entitlement_decision_core',
    'access_decision_core',
    'approval_decision_core',
    'accounting_decision_core',
    'inventory_decision_core',
    'secrets'
  ]
};

(function (global) {
  'use strict';

  var bridge = global.BusinessOSCommonOSProviderBridge;

  if (!bridge) {
    return;
  }

  bridge.requireProvider = function () {
    if (!global.CommonOSRuntime) {
      throw new Error('CommonOSRuntime is required');
    }

    if (
      !global.CommonOSShell ||
      typeof global.CommonOSShell.createShell !== 'function'
    ) {
      throw new Error('CommonOSShell.createShell is required');
    }

    if (
      !global.CommonOSSync ||
      typeof global.CommonOSSync.queueCard !== 'function' ||
      typeof global.CommonOSSync.queueGrid !== 'function'
    ) {
      throw new Error('CommonOSSync queue presentation is required');
    }

    return {
      runtime: global.CommonOSRuntime,
      shell: global.CommonOSShell,
      sync: global.CommonOSSync
    };
  };
})(window);
