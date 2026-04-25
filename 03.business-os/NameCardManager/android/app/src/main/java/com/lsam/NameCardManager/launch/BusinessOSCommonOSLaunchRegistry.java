package com.lsam.NameCardManager.launch;

public final class BusinessOSCommonOSLaunchRegistry {

    public BusinessOSCommonOSLaunchDescriptor createDefault() {
        return new BusinessOSCommonOSLaunchDescriptor(
                "NameCardManager",
                "launch_via_commonos_consumer",
                "businessos-commonos-consumer",
                "_commonos",
                "shared_provider",
                "os_side_consumer",
                "CommonOS",
                "NameCardManager"
        );
    }
}
