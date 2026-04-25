package com.lsam.PocketSecretary.runtime.commonos.entry;

public final class CommonOSEntrySmoke {

    public static void main(final String[] args) {
        final CommonOSEntryRegistry registry = new CommonOSEntryRegistry();
        final CommonOSEntryDescriptor descriptor = registry.createDefault();

        if (!"PocketSecretary".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!descriptor.getCommonComponentUsage().contains("App Shell")) {
            throw new IllegalStateException("Missing App Shell");
        }
        if (!descriptor.getVariantUsage().contains("panel.sync")) {
            throw new IllegalStateException("Missing panel.sync");
        }

        System.out.println("COMMONOS_ENTRY_ANDROID_OK:PocketSecretary");
        System.out.println(descriptor.getAppName() + " usage=" + descriptor.getCommonComponentUsage().size());
    }
}
