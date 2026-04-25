package com.lsam.PocketSecretary.runtime.commonos.contract;

public final class CommonOSContractSmoke {

    public static void main(final String[] args) {
        final CommonOSContractRegistry registry = new CommonOSContractRegistry();
        final CommonOSContractDescriptor descriptor = registry.createDefault();

        if (!"PocketSecretary".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!"offline-first".equals(descriptor.getSyncMode())) {
            throw new IllegalStateException("Unexpected sync mode");
        }
        if (!descriptor.getClientCapabilities().contains("push_notification")) {
            throw new IllegalStateException("Missing push_notification");
        }
        if (!descriptor.getRetryStates().contains("retry_wait")) {
            throw new IllegalStateException("Missing retry_wait");
        }

        System.out.println("COMMONOS_CONTRACT_ANDROID_OK:PocketSecretary");
        System.out.println(descriptor.getAppName() + " syncTriggers=" + descriptor.getSyncTriggers().size());
        System.out.println("queuePresentationOwner=" + descriptor.getQueuePresentationOwner());
    }
}
