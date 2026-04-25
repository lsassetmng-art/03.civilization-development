package com.lsam.NameCardManager.runtime.commonos.localqueue;

public final class CommonOSLocalQueueSmoke {

    public static void main(final String[] args) {
        final CommonOSLocalQueueRegistry registry = new CommonOSLocalQueueRegistry();
        final CommonOSLocalQueueDescriptor descriptor = registry.createDefault();

        if (!"NameCardManager".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!"offline-first".equals(descriptor.getSyncMode())) {
            throw new IllegalStateException("Unexpected sync mode");
        }
        if (!descriptor.getQueueKinds().contains("ocr_review")) {
            throw new IllegalStateException("Missing ocr_review");
        }
        if (!descriptor.getRetryStates().contains("retry_wait")) {
            throw new IllegalStateException("Missing retry_wait");
        }

        System.out.println("COMMONOS_LOCAL_QUEUE_ANDROID_OK:NameCardManager");
        System.out.println(descriptor.getAppName() + " queueKinds=" + descriptor.getQueueKinds().size());
        System.out.println("structuredState=" + descriptor.getStructuredStateStorage());
        System.out.println("localOutbox=" + descriptor.getLocalOutboxStorage());
    }
}
