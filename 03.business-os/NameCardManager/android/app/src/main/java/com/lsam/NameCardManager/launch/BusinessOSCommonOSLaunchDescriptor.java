package com.lsam.NameCardManager.launch;

public final class BusinessOSCommonOSLaunchDescriptor {
    private final String appName;
    private final String launchMode;
    private final String defaultTarget;
    private final String consumerTarget;
    private final String providerRole;
    private final String consumerRole;
    private final String uiOwner;
    private final String businessOwner;

    public BusinessOSCommonOSLaunchDescriptor(
            final String appName,
            final String launchMode,
            final String defaultTarget,
            final String consumerTarget,
            final String providerRole,
            final String consumerRole,
            final String uiOwner,
            final String businessOwner
    ) {
        this.appName = appName;
        this.launchMode = launchMode;
        this.defaultTarget = defaultTarget;
        this.consumerTarget = consumerTarget;
        this.providerRole = providerRole;
        this.consumerRole = consumerRole;
        this.uiOwner = uiOwner;
        this.businessOwner = businessOwner;
    }

    public String getAppName() { return appName; }
    public String getLaunchMode() { return launchMode; }
    public String getDefaultTarget() { return defaultTarget; }
    public String getConsumerTarget() { return consumerTarget; }
    public String getProviderRole() { return providerRole; }
    public String getConsumerRole() { return consumerRole; }
    public String getUiOwner() { return uiOwner; }
    public String getBusinessOwner() { return businessOwner; }
}
