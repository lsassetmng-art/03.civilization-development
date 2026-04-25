package com.lsam.PocketSecretary.runtime.commonos.contract;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class CommonOSContractDescriptor {
    private final String appName;
    private final String syncMode;
    private final boolean localQueueEnabled;
    private final boolean onlineSyncEnabled;
    private final List<String> syncTriggers;
    private final List<String> retryStates;
    private final String queuePresentationOwner;
    private final String queueBusinessMeaningOwner;
    private final List<String> clientCapabilities;
    private final List<String> accessibilityPresets;

    public CommonOSContractDescriptor(
            final String appName,
            final String syncMode,
            final boolean localQueueEnabled,
            final boolean onlineSyncEnabled,
            final List<String> syncTriggers,
            final List<String> retryStates,
            final String queuePresentationOwner,
            final String queueBusinessMeaningOwner,
            final List<String> clientCapabilities,
            final List<String> accessibilityPresets
    ) {
        this.appName = appName;
        this.syncMode = syncMode;
        this.localQueueEnabled = localQueueEnabled;
        this.onlineSyncEnabled = onlineSyncEnabled;
        this.syncTriggers = new ArrayList<>(syncTriggers);
        this.retryStates = new ArrayList<>(retryStates);
        this.queuePresentationOwner = queuePresentationOwner;
        this.queueBusinessMeaningOwner = queueBusinessMeaningOwner;
        this.clientCapabilities = new ArrayList<>(clientCapabilities);
        this.accessibilityPresets = new ArrayList<>(accessibilityPresets);
    }

    public String getAppName() { return appName; }
    public String getSyncMode() { return syncMode; }
    public boolean isLocalQueueEnabled() { return localQueueEnabled; }
    public boolean isOnlineSyncEnabled() { return onlineSyncEnabled; }
    public List<String> getSyncTriggers() { return Collections.unmodifiableList(syncTriggers); }
    public List<String> getRetryStates() { return Collections.unmodifiableList(retryStates); }
    public String getQueuePresentationOwner() { return queuePresentationOwner; }
    public String getQueueBusinessMeaningOwner() { return queueBusinessMeaningOwner; }
    public List<String> getClientCapabilities() { return Collections.unmodifiableList(clientCapabilities); }
    public List<String> getAccessibilityPresets() { return Collections.unmodifiableList(accessibilityPresets); }
}
