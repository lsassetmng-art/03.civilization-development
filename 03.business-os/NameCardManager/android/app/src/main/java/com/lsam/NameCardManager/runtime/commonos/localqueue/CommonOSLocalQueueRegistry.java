package com.lsam.NameCardManager.runtime.commonos.localqueue;

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
        queueKinds.add("capture_image_intake");
        queueKinds.add("ocr_review");
        queueKinds.add("relationship_merge_review");

        return new CommonOSLocalQueueDescriptor(
                "NameCardManager",
                "offline-first",
                syncTriggers,
                retryStates,
                queueKinds,
                "indexeddb_equivalent",
                "local_outbox_queue"
        );
    }
}
