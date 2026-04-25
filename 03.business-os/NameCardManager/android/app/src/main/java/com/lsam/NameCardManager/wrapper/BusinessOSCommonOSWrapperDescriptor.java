package com.lsam.NameCardManager.wrapper;

public final class BusinessOSCommonOSWrapperDescriptor {
    private final String appName;
    private final String providerRoot;
    private final String consumerRoot;
    private final String providerRole;
    private final String consumerRole;
    private final String adapterModule;
    private final String bridgeModule;
    private final String mapperModule;
    private final String presenterModule;
    private final String themeModule;
    private final String syncModule;
    private final String uiOwner;
    private final String businessOwner;

    public BusinessOSCommonOSWrapperDescriptor(
            final String appName,
            final String providerRoot,
            final String consumerRoot,
            final String providerRole,
            final String consumerRole,
            final String adapterModule,
            final String bridgeModule,
            final String mapperModule,
            final String presenterModule,
            final String themeModule,
            final String syncModule,
            final String uiOwner,
            final String businessOwner
    ) {
        this.appName = appName;
        this.providerRoot = providerRoot;
        this.consumerRoot = consumerRoot;
        this.providerRole = providerRole;
        this.consumerRole = consumerRole;
        this.adapterModule = adapterModule;
        this.bridgeModule = bridgeModule;
        this.mapperModule = mapperModule;
        this.presenterModule = presenterModule;
        this.themeModule = themeModule;
        this.syncModule = syncModule;
        this.uiOwner = uiOwner;
        this.businessOwner = businessOwner;
    }

    public String getAppName() { return appName; }
    public String getProviderRoot() { return providerRoot; }
    public String getConsumerRoot() { return consumerRoot; }
    public String getProviderRole() { return providerRole; }
    public String getConsumerRole() { return consumerRole; }
    public String getAdapterModule() { return adapterModule; }
    public String getBridgeModule() { return bridgeModule; }
    public String getMapperModule() { return mapperModule; }
    public String getPresenterModule() { return presenterModule; }
    public String getThemeModule() { return themeModule; }
    public String getSyncModule() { return syncModule; }
    public String getUiOwner() { return uiOwner; }
    public String getBusinessOwner() { return businessOwner; }
}
