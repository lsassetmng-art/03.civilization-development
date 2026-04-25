window.BusinessOSCommonOSViewMapper = {
  toShellViewModel: function (appConfig, adapter, syncRegistry, bridge) {
    return {
      appName: appConfig.appName,
      headline: appConfig.headline,
      sections: appConfig.sections || [],
      providerRole: bridge.providerRole,
      consumerRole: bridge.consumerRole,
      uiOwner: syncRegistry.presentationOwner,
      businessOwner: adapter.businessOwner,
      commonComponentUsage: adapter.commonComponentUsage || [],
      variantUsage: adapter.variantUsage || [],
      syncMode: syncRegistry.syncMode,
      syncTriggers: syncRegistry.syncTriggers || [],
      queueStates: syncRegistry.queueStates || []
    };
  }
};
