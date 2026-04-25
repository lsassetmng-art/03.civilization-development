package com.lsam.NameCardManager.runtime.commonos.transport;

public final class CommonOSTransportRegistry {

    public CommonOSTransportDescriptor createDefault() {
        return new CommonOSTransportDescriptor(
                "NameCardManager",
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
