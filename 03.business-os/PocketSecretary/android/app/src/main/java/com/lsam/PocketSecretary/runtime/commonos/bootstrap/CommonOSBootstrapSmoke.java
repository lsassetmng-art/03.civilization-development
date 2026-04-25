package com.lsam.PocketSecretary.runtime.commonos.bootstrap;

public final class CommonOSBootstrapSmoke {

    public static void main(final String[] args) {
        final CommonOSBootstrapRegistry registry = new CommonOSBootstrapRegistry();
        final CommonOSBootstrapDescriptor descriptor = registry.createDefault();

        if (!"PocketSecretary".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!"CommonOS".equals(descriptor.getUiOwner())) {
            throw new IllegalStateException("Unexpected UI owner");
        }
        if (!"PocketSecretary".equals(descriptor.getBusinessCanonOwner())) {
            throw new IllegalStateException("Unexpected business canon owner");
        }

        System.out.println("COMMONOS_BOOTSTRAP_ANDROID_OK:PocketSecretary");
        System.out.println(descriptor.getAppName() + " launchMode=" + descriptor.getLaunchMode());
        System.out.println("runtime=" + descriptor.getRuntimeRoute());
        System.out.println("entry=" + descriptor.getEntryRoute());
        System.out.println("contract=" + descriptor.getContractRoute());
    }
}
