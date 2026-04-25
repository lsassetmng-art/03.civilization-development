package com.lsam.NameCardManager.runtime.commonos.metadata;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class CommonOSMetadataDescriptor {
    private final String appName;
    private final List<String> localeKeys;
    private final List<String> screenTemplates;
    private final List<String> helpTemplates;
    private final List<String> notificationTemplates;
    private final String attachmentTemporaryHolding;
    private final String attachmentPreviewShell;
    private final List<String> attachmentAllowedKinds;
    private final List<String> exportTemplates;

    public CommonOSMetadataDescriptor(
            final String appName,
            final List<String> localeKeys,
            final List<String> screenTemplates,
            final List<String> helpTemplates,
            final List<String> notificationTemplates,
            final String attachmentTemporaryHolding,
            final String attachmentPreviewShell,
            final List<String> attachmentAllowedKinds,
            final List<String> exportTemplates
    ) {
        this.appName = appName;
        this.localeKeys = new ArrayList<>(localeKeys);
        this.screenTemplates = new ArrayList<>(screenTemplates);
        this.helpTemplates = new ArrayList<>(helpTemplates);
        this.notificationTemplates = new ArrayList<>(notificationTemplates);
        this.attachmentTemporaryHolding = attachmentTemporaryHolding;
        this.attachmentPreviewShell = attachmentPreviewShell;
        this.attachmentAllowedKinds = new ArrayList<>(attachmentAllowedKinds);
        this.exportTemplates = new ArrayList<>(exportTemplates);
    }

    public String getAppName() { return appName; }
    public List<String> getLocaleKeys() { return Collections.unmodifiableList(localeKeys); }
    public List<String> getScreenTemplates() { return Collections.unmodifiableList(screenTemplates); }
    public List<String> getHelpTemplates() { return Collections.unmodifiableList(helpTemplates); }
    public List<String> getNotificationTemplates() { return Collections.unmodifiableList(notificationTemplates); }
    public String getAttachmentTemporaryHolding() { return attachmentTemporaryHolding; }
    public String getAttachmentPreviewShell() { return attachmentPreviewShell; }
    public List<String> getAttachmentAllowedKinds() { return Collections.unmodifiableList(attachmentAllowedKinds); }
    public List<String> getExportTemplates() { return Collections.unmodifiableList(exportTemplates); }
}
