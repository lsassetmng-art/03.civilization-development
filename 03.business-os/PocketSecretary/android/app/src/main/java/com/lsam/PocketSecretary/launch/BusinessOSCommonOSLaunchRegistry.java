package com.lsam.PocketSecretary.launch;

public final class BusinessOSCommonOSLaunchRegistry {

    public BusinessOSCommonOSLaunchDescriptor createDefault() {
        return new BusinessOSCommonOSLaunchDescriptor(
                "PocketSecretary",
                "launch_via_commonos_consumer",
                "businessos-commonos-consumer",
                "_commonos",
                "shared_provider",
                "os_side_consumer",
                "CommonOS",
                "PocketSecretary"
        );
    }
}
