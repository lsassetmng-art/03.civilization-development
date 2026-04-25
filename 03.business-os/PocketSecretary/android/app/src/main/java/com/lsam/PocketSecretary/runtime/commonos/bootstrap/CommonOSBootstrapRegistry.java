package com.lsam.PocketSecretary.runtime.commonos.bootstrap;

public final class CommonOSBootstrapRegistry {

    public CommonOSBootstrapDescriptor createDefault() {
        return new CommonOSBootstrapDescriptor(
                "PocketSecretary",
                "commonos_bootstrap",
                "CommonOS",
                "PocketSecretary",
                "runtime/commonos",
                "runtime/commonos/entry",
                "runtime/commonos/contract"
        );
    }
}
