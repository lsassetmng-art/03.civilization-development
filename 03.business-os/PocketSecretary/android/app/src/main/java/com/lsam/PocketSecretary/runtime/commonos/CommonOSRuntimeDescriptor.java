package com.lsam.PocketSecretary.runtime.commonos;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class CommonOSRuntimeDescriptor {
    private final String appName;
    private final List<String> commonComponentUsage;
    private final List<String> featureVariants;

    public CommonOSRuntimeDescriptor(
            final String appName,
            final List<String> commonComponentUsage,
            final List<String> featureVariants
    ) {
        this.appName = appName;
        this.commonComponentUsage = new ArrayList<>(commonComponentUsage);
        this.featureVariants = new ArrayList<>(featureVariants);
    }

    public String getAppName() {
        return appName;
    }

    public List<String> getCommonComponentUsage() {
        return Collections.unmodifiableList(commonComponentUsage);
    }

    public List<String> getFeatureVariants() {
        return Collections.unmodifiableList(featureVariants);
    }
}
