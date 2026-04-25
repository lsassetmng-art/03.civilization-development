package com.lsam.PocketSecretary.commonosconsumer;

public final class BusinessOSCommonOSConsumerRegistry {
    public BusinessOSCommonOSConsumerDescriptor createDefault() {
        return new BusinessOSCommonOSConsumerDescriptor(
                "PocketSecretary",
                "shared_provider",
                "os_side_consumer",
                "~/03.civilization-development/03.business-os/_commonos",
                "CommonOS",
                "PocketSecretary",
                "offline-first"
        );
    }
}
