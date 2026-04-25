window.BusinessOSCommonOSAdapters = {
  NameCardManager: {
    appName: 'NameCardManager',
    businessOwner: 'NameCardManager',
    listMode: 'record_card',
    detailMode: 'side_panel',
    commonComponentUsage: [
      'App Shell',
      'Card',
      'List',
      'Search Bar',
      'Filter Panel',
      'Status Chip',
      'Attachment UI',
      'Offline Queue Status UI',
      'Sync Retry UI',
      'Conflict Review UI'
    ],
    variantUsage: [
      'card.record',
      'panel.sync',
      'panel.conflict',
      'input.default',
      'button.primary'
    ]
  },

  PocketSecretary: {
    appName: 'PocketSecretary',
    businessOwner: 'PocketSecretary',
    listMode: 'queue_standard',
    detailMode: 'detail_standard',
    commonComponentUsage: [
      'App Shell',
      'Card',
      'List',
      'Search Bar',
      'Filter Panel',
      'Status Chip',
      'Toast',
      'Offline Queue Status UI',
      'Sync Retry UI',
      'Conflict Review UI'
    ],
    variantUsage: [
      'card.standard',
      'panel.sync',
      'panel.conflict',
      'input.compact',
      'button.primary'
    ]
  }
};
