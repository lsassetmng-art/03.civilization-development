package com.lsam.PocketSecretary.commonosconsumer;

public final class BusinessOSCommonOSConsumerSmoke {
    public static void main(final String[] args) {
        final BusinessOSCommonOSConsumerRegistry registry = new BusinessOSCommonOSConsumerRegistry();
        final BusinessOSCommonOSConsumerDescriptor descriptor = registry.createDefault();

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
            throw new IllegalStateException("Unexpected UI owner");
        }
        if (!"PocketSecretary".equals(descriptor.getBusinessOwner())) {
            throw new IllegalStateException("Unexpected business owner");
        }

        System.out.println("BUSINESSOS_COMMONOS_CONSUMER_ANDROID_OK:PocketSecretary");
        System.out.println(descriptor.getAppName() + " consumerRoot=" + descriptor.getConsumerRoot());
        System.out.println("syncMode=" + descriptor.getSyncMode());
    }
}
