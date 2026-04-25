package com.lsam.PocketSecretary.runtime.commonos.transport;

public final class CommonOSTransportRegistry {

    public CommonOSTransportDescriptor createDefault() {
        return new CommonOSTransportDescriptor(
                "PocketSecretary",
                "requestId",
                "traceId",
                "syncStatus",
                "clientTimestamp",
                "serverTimestamp",
                "items",
                "nextPageToken",
                "totalCount",
                "errorCode",
                "errorMessage",
                "errorDetails"
        );
    }
}
