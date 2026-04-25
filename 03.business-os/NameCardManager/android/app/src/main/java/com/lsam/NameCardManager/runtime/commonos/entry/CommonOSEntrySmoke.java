package com.lsam.NameCardManager.runtime.commonos.entry;

public final class CommonOSEntrySmoke {

    public static void main(final String[] args) {
        final CommonOSEntryRegistry registry = new CommonOSEntryRegistry();
        final CommonOSEntryDescriptor descriptor = registry.createDefault();

        if (!"NameCardManager".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!descriptor.getCommonComponentUsage().contains("App Shell")) {
            throw new IllegalStateException("Missing App Shell");
        }
        if (!descriptor.getVariantUsage().contains("card.record")) {
            throw new IllegalStateException("Missing card.record");
        }

        System.out.println("COMMONOS_ENTRY_ANDROID_OK:NameCardManager");
        System.out.println(descriptor.getAppName() + " usage=" + descriptor.getCommonComponentUsage().size());
    }
}
