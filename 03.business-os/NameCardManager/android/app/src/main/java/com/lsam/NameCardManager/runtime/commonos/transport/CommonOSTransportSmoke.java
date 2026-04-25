package com.lsam.NameCardManager.runtime.commonos.transport;

public final class CommonOSTransportSmoke {

    public static void main(final String[] args) {
        final CommonOSTransportRegistry registry = new CommonOSTransportRegistry();
        final CommonOSTransportDescriptor descriptor = registry.createDefault();

        if (!"NameCardManager".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!"requestId".equals(descriptor.getRequestIdField())) {
            throw new IllegalStateException("Unexpected requestId field");
        }
        if (!"items".equals(descriptor.getItemsField())) {
            throw new IllegalStateException("Unexpected items field");
        }
        if (!"errorCode".equals(descriptor.getErrorCodeField())) {
            throw new IllegalStateException("Unexpected errorCode field");
        }

        System.out.println("COMMONOS_TRANSPORT_ANDROID_OK:NameCardManager");
        System.out.println(descriptor.getAppName() + " requestId=" + descriptor.getRequestIdField());
        System.out.println("pagination=" + descriptor.getItemsField() + "/" + descriptor.getNextPageTokenField());
        System.out.println("error=" + descriptor.getErrorCodeField() + "/" + descriptor.getErrorMessageField());
    }
}
