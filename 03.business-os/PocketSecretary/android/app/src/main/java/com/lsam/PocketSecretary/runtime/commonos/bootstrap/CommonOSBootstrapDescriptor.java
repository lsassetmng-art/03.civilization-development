package com.lsam.PocketSecretary.runtime.commonos.bootstrap;

public final class CommonOSBootstrapDescriptor {
    private final String appName;
    private final String launchMode;
    private final String uiOwner;
    private final String businessCanonOwner;
    private final String runtimeRoute;
    private final String entryRoute;
    private final String contractRoute;

    public CommonOSBootstrapDescriptor(
            final String appName,
            final String launchMode,
            final String uiOwner,
            final String businessCanonOwner,
            final String runtimeRoute,
            final String entryRoute,
            final String contractRoute
    ) {
        this.appName = appName;
        this.launchMode = launchMode;
        this.uiOwner = uiOwner;
        this.businessCanonOwner = businessCanonOwner;
        this.runtimeRoute = runtimeRoute;
        this.entryRoute = entryRoute;
        this.contractRoute = contractRoute;
    }

    public String getAppName() { return appName; }
    public String getLaunchMode() { return launchMode; }
    public String getUiOwner() { return uiOwner; }
    public String getBusinessCanonOwner() { return businessCanonOwner; }
    public String getRuntimeRoute() { return runtimeRoute; }
    public String getEntryRoute() { return entryRoute; }
    public String getContractRoute() { return contractRoute; }
}
