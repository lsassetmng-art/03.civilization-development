package com.lsam.NameCardManager.runtime.commonos.localqueue;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class CommonOSLocalQueueDescriptor {
    private final String appName;
    private final String syncMode;
    private final List<String> syncTriggers;
    private final List<String> retryStates;
    private final List<String> queueKinds;
    private final String structuredStateStorage;
    private final String localOutboxStorage;

    public CommonOSLocalQueueDescriptor(
            final String appName,
            final String syncMode,
            final List<String> syncTriggers,
            final List<String> retryStates,
            final List<String> queueKinds,
            final String structuredStateStorage,
            final String localOutboxStorage
    ) {
        this.appName = appName;
        this.syncMode = syncMode;
        this.syncTriggers = new ArrayList<>(syncTriggers);
        this.retryStates = new ArrayList<>(retryStates);
        this.queueKinds = new ArrayList<>(queueKinds);
        this.structuredStateStorage = structuredStateStorage;
        this.localOutboxStorage = localOutboxStorage;
    }

    public String getAppName() { return appName; }
    public String getSyncMode() { return syncMode; }
    public List<String> getSyncTriggers() { return Collections.unmodifiableList(syncTriggers); }
    public List<String> getRetryStates() { return Collections.unmodifiableList(retryStates); }
    public List<String> getQueueKinds() { return Collections.unmodifiableList(queueKinds); }
    public String getStructuredStateStorage() { return structuredStateStorage; }
    public String getLocalOutboxStorage() { return localOutboxStorage; }
}
