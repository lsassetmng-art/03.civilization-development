package com.lsam.PocketSecretary.wrapper;

public final class BusinessOSCommonOSWrapperRegistry {

    public BusinessOSCommonOSWrapperDescriptor createDefault() {
        return new BusinessOSCommonOSWrapperDescriptor(
                "PocketSecretary",
                "~/03.civilization-development/12.common-os",
                "~/03.civilization-development/03.business-os/_commonos",
                "shared_provider",
                "os_side_consumer",
                "adapter",
                "bridge",
                "mapper",
                "presenter",
                "theme",
                "sync",
                "CommonOS",
                "PocketSecretary"
        );
    }
}
