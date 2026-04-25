package com.lsam.NameCardManager.runtime.commonos.entry;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class CommonOSEntryDescriptor {
    private final String appName;
    private final List<String> commonComponentUsage;
    private final List<String> variantUsage;

    public CommonOSEntryDescriptor(
            final String appName,
            final List<String> commonComponentUsage,
            final List<String> variantUsage
    ) {
        this.appName = appName;
        this.commonComponentUsage = new ArrayList<>(commonComponentUsage);
        this.variantUsage = new ArrayList<>(variantUsage);
    }

    public String getAppName() {
        return appName;
    }

    public List<String> getCommonComponentUsage() {
        return Collections.unmodifiableList(commonComponentUsage);
    }

    public List<String> getVariantUsage() {
        return Collections.unmodifiableList(variantUsage);
    }
}
