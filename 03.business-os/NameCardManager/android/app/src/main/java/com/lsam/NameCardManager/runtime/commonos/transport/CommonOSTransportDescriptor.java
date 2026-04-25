package com.lsam.NameCardManager.runtime.commonos.transport;

public final class CommonOSTransportDescriptor {
    private final String appName;
    private final String requestIdField;
    private final String traceIdField;
    private final String syncStatusField;
    private final String clientTimestampField;
    private final String serverTimestampField;
    private final String itemsField;
    private final String nextPageTokenField;
    private final String totalCountField;
    private final String errorCodeField;
    private final String errorMessageField;
    private final String errorDetailsField;

    public CommonOSTransportDescriptor(
            final String appName,
            final String requestIdField,
            final String traceIdField,
            final String syncStatusField,
            final String clientTimestampField,
            final String serverTimestampField,
            final String itemsField,
            final String nextPageTokenField,
            final String totalCountField,
            final String errorCodeField,
            final String errorMessageField,
            final String errorDetailsField
    ) {
        this.appName = appName;
        this.requestIdField = requestIdField;
        this.traceIdField = traceIdField;
        this.syncStatusField = syncStatusField;
        this.clientTimestampField = clientTimestampField;
        this.serverTimestampField = serverTimestampField;
        this.itemsField = itemsField;
        this.nextPageTokenField = nextPageTokenField;
        this.totalCountField = totalCountField;
        this.errorCodeField = errorCodeField;
        this.errorMessageField = errorMessageField;
        this.errorDetailsField = errorDetailsField;
    }

    public String getAppName() { return appName; }
    public String getRequestIdField() { return requestIdField; }
    public String getTraceIdField() { return traceIdField; }
    public String getSyncStatusField() { return syncStatusField; }
    public String getClientTimestampField() { return clientTimestampField; }
    public String getServerTimestampField() { return serverTimestampField; }
    public String getItemsField() { return itemsField; }
    public String getNextPageTokenField() { return nextPageTokenField; }
    public String getTotalCountField() { return totalCountField; }
    public String getErrorCodeField() { return errorCodeField; }
    public String getErrorMessageField() { return errorMessageField; }
    public String getErrorDetailsField() { return errorDetailsField; }
}
