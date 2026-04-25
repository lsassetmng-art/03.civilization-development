package com.lsam.PocketSecretary.runtime.commonos.localqueue;

import java.util.ArrayList;
import java.util.List;

public final class CommonOSLocalQueueRegistry {

    public CommonOSLocalQueueDescriptor createDefault() {
        final List<String> syncTriggers = new ArrayList<>();
        syncTriggers.add("app_launch");
        syncTriggers.add("foreground_resume");
        syncTriggers.add("online_recovery");
        syncTriggers.add("manual_sync");
        syncTriggers.add("send_possible");

        final List<String> retryStates = new ArrayList<>();
        retryStates.add("retry_wait");
        retryStates.add("failed");
        retryStates.add("processing");

        final List<String> queueKinds = new ArrayList<>();
        queueKinds.add("briefing_refresh");
        queueKinds.add("follow_through_update");
        queueKinds.add("conversation_action_write");

        return new CommonOSLocalQueueDescriptor(
                "PocketSecretary",
                "offline-first",
                syncTriggers,
                retryStates,
                queueKinds,
                "indexeddb_equivalent",
                "local_outbox_queue"
        );
    }
}
