package com.lsam.PocketSecretary.wrapper;

public final class BusinessOSCommonOSWrapperSmoke {

    public static void main(final String[] args) {
        final BusinessOSCommonOSWrapperRegistry registry = new BusinessOSCommonOSWrapperRegistry();
        final BusinessOSCommonOSWrapperDescriptor descriptor = registry.createDefault();

        if (!"PocketSecretary".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!"shared_provider".equals(descriptor.getProviderRole())) {
            throw new IllegalStateException("Unexpected provider role");
        }
        if (!"os_side_consumer".equals(descriptor.getConsumerRole())) {
            throw new IllegalStateException("Unexpected consumer role");
        }
        if (!"CommonOS".equals(descriptor.getUiOwner())) {
            throw new IllegalStateException("Unexpected ui owner");
        }
        if (!"PocketSecretary".equals(descriptor.getBusinessOwner())) {
            throw new IllegalStateException("Unexpected business owner");
        }

        System.out.println("ANDROID_WRAPPER_OK:PocketSecretary");
        System.out.println(descriptor.getAppName() + " provider=" + descriptor.getProviderRoot());
        System.out.println("consumer=" + descriptor.getConsumerRoot());
        System.out.println("modules=" + descriptor.getAdapterModule() + "," + descriptor.getBridgeModule() + "," + descriptor.getMapperModule() + "," + descriptor.getPresenterModule() + "," + descriptor.getThemeModule() + "," + descriptor.getSyncModule());
    }
}
