package com.lsam.PocketSecretary.commonosconsumer;

public final class BusinessOSCommonOSConsumerDescriptor {
    private final String appName;
    private final String providerRole;
    private final String consumerRole;
    private final String consumerRoot;
    private final String uiOwner;
    private final String businessOwner;
    private final String syncMode;

    public BusinessOSCommonOSConsumerDescriptor(
            final String appName,
            final String providerRole,
            final String consumerRole,
            final String consumerRoot,
            final String uiOwner,
            final String businessOwner,
            final String syncMode
    ) {
        this.appName = appName;
        this.providerRole = providerRole;
        this.consumerRole = consumerRole;
        this.consumerRoot = consumerRoot;
        this.uiOwner = uiOwner;
        this.businessOwner = businessOwner;
        this.syncMode = syncMode;
    }

    public String getAppName() { return appName; }
    public String getProviderRole() { return providerRole; }
    public String getConsumerRole() { return consumerRole; }
    public String getConsumerRoot() { return consumerRoot; }
    public String getUiOwner() { return uiOwner; }
    public String getBusinessOwner() { return businessOwner; }
    public String getSyncMode() { return syncMode; }
}
