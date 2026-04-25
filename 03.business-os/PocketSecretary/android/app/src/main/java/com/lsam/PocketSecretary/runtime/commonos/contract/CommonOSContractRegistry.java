package com.lsam.PocketSecretary.runtime.commonos.contract;

import java.util.ArrayList;
import java.util.List;

public final class CommonOSContractRegistry {

    public CommonOSContractDescriptor createDefault() {
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

        final List<String> capabilities = new ArrayList<>();
        capabilities.add("file_picker");
        capabilities.add("offline_storage");
        capabilities.add("share_sheet");
        capabilities.add("push_notification");

        final List<String> accessibility = new ArrayList<>();
        accessibility.add("large_touch_target");
        accessibility.add("screen_reader_label_rule");
        accessibility.add("contrast_safe_default");

        return new CommonOSContractDescriptor(
                "PocketSecretary",
                "offline-first",
                true,
                true,
                syncTriggers,
                retryStates,
                "CommonOS",
                "PocketSecretary",
                capabilities,
                accessibility
        );
    }
}
