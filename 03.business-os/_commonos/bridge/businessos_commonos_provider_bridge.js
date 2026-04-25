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
