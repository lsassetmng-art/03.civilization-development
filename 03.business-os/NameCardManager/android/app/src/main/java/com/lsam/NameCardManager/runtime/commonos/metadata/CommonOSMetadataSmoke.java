package com.lsam.NameCardManager.runtime.commonos.metadata;

public final class CommonOSMetadataSmoke {

    public static void main(final String[] args) {
        final CommonOSMetadataRegistry registry = new CommonOSMetadataRegistry();
        final CommonOSMetadataDescriptor descriptor = registry.createDefault();

        if (!"NameCardManager".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!descriptor.getLocaleKeys().contains("name_card_manager.capture.title")) {
            throw new IllegalStateException("Missing locale key");
        }
        if (!descriptor.getAttachmentAllowedKinds().contains("image")) {
            throw new IllegalStateException("Missing image attachment");
        }
        if (!descriptor.getExportTemplates().contains("contact_export_csv")) {
            throw new IllegalStateException("Missing export template");
        }

        System.out.println("COMMONOS_METADATA_ANDROID_OK:NameCardManager");
        System.out.println(descriptor.getAppName() + " localeKeys=" + descriptor.getLocaleKeys().size());
        System.out.println("attachmentPreviewShell=" + descriptor.getAttachmentPreviewShell());
    }
}
