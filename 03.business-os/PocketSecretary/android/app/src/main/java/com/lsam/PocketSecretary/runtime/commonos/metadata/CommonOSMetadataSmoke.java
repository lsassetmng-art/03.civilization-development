package com.lsam.PocketSecretary.runtime.commonos.metadata;

public final class CommonOSMetadataSmoke {

    public static void main(final String[] args) {
        final CommonOSMetadataRegistry registry = new CommonOSMetadataRegistry();
        final CommonOSMetadataDescriptor descriptor = registry.createDefault();

        if (!"PocketSecretary".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!descriptor.getLocaleKeys().contains("pocket_secretary.briefing.title")) {
            throw new IllegalStateException("Missing locale key");
        }
        if (!descriptor.getAttachmentAllowedKinds().contains("text")) {
            throw new IllegalStateException("Missing text attachment");
        }
        if (!descriptor.getExportTemplates().contains("briefing_export_pdf")) {
            throw new IllegalStateException("Missing export template");
        }

        System.out.println("COMMONOS_METADATA_ANDROID_OK:PocketSecretary");
        System.out.println(descriptor.getAppName() + " localeKeys=" + descriptor.getLocaleKeys().size());
        System.out.println("attachmentPreviewShell=" + descriptor.getAttachmentPreviewShell());
    }
}
