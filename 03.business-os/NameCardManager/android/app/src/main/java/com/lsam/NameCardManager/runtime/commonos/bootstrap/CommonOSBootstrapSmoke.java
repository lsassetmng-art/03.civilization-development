package com.lsam.NameCardManager.runtime.commonos.bootstrap;

public final class CommonOSBootstrapSmoke {

    public static void main(final String[] args) {
        final CommonOSBootstrapRegistry registry = new CommonOSBootstrapRegistry();
        final CommonOSBootstrapDescriptor descriptor = registry.createDefault();

        if (!"NameCardManager".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!"CommonOS".equals(descriptor.getUiOwner())) {
            throw new IllegalStateException("Unexpected UI owner");
        }
        if (!"NameCardManager".equals(descriptor.getBusinessCanonOwner())) {
            throw new IllegalStateException("Unexpected business canon owner");
        }

        System.out.println("COMMONOS_BOOTSTRAP_ANDROID_OK:NameCardManager");
        System.out.println(descriptor.getAppName() + " launchMode=" + descriptor.getLaunchMode());
        System.out.println("runtime=" + descriptor.getRuntimeRoute());
        System.out.println("entry=" + descriptor.getEntryRoute());
        System.out.println("contract=" + descriptor.getContractRoute());
    }
}
