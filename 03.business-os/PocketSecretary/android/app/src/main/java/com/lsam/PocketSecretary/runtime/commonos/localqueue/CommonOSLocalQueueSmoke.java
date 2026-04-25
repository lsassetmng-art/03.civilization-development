package com.lsam.PocketSecretary.runtime.commonos.localqueue;

public final class CommonOSLocalQueueSmoke {

    public static void main(final String[] args) {
        final CommonOSLocalQueueRegistry registry = new CommonOSLocalQueueRegistry();
        final CommonOSLocalQueueDescriptor descriptor = registry.createDefault();

        if (!"PocketSecretary".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!"offline-first".equals(descriptor.getSyncMode())) {
            throw new IllegalStateException("Unexpected sync mode");
        }
        if (!descriptor.getQueueKinds().contains("conversation_action_write")) {
            throw new IllegalStateException("Missing conversation_action_write");
        }
        if (!descriptor.getRetryStates().contains("retry_wait")) {
            throw new IllegalStateException("Missing retry_wait");
        }

        System.out.println("COMMONOS_LOCAL_QUEUE_ANDROID_OK:PocketSecretary");
        System.out.println(descriptor.getAppName() + " queueKinds=" + descriptor.getQueueKinds().size());
        System.out.println("structuredState=" + descriptor.getStructuredStateStorage());
        System.out.println("localOutbox=" + descriptor.getLocalOutboxStorage());
    }
}
