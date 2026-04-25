window.BusinessOSCommonOSMapper = {
  toShellViewModel: function (appConfig, adapter, syncRegistry) {
    return {
      appName: appConfig.appName,
      headline: appConfig.headline,
      sections: appConfig.sections || [],
      commonComponentUsage: adapter.commonComponentUsage || [],
      variantUsage: adapter.variantUsage || [],
      syncMode: syncRegistry.syncMode,
      syncTriggers: syncRegistry.syncTriggers || [],
      queueStates: syncRegistry.queueStates || [],
      presentationOwner: syncRegistry.presentationOwner,
      businessMeaningOwner: adapter.syncMeaningOwner
    };
  }
};
