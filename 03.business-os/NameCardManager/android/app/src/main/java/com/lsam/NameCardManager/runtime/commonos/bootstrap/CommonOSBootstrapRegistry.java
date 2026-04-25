package com.lsam.NameCardManager.runtime.commonos.bootstrap;

public final class CommonOSBootstrapRegistry {

    public CommonOSBootstrapDescriptor createDefault() {
        return new CommonOSBootstrapDescriptor(
                "NameCardManager",
                "commonos_bootstrap",
                "CommonOS",
                "NameCardManager",
                "runtime/commonos",
                "runtime/commonos/entry",
                "runtime/commonos/contract"
        );
    }
}
