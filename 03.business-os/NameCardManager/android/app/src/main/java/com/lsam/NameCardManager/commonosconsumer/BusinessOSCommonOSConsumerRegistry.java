package com.lsam.NameCardManager.commonosconsumer;

public final class BusinessOSCommonOSConsumerRegistry {
    public BusinessOSCommonOSConsumerDescriptor createDefault() {
        return new BusinessOSCommonOSConsumerDescriptor(
                "NameCardManager",
                "shared_provider",
                "os_side_consumer",
                "~/03.civilization-development/03.business-os/_commonos",
                "CommonOS",
                "NameCardManager",
                "offline-first"
        );
    }
}
