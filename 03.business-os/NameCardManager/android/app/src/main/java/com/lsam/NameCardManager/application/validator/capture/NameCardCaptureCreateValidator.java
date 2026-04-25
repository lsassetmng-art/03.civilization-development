package com.lsam.NameCardManager.application.validator.capture;

import com.lsam.NameCardManager.api.dto.capture.request.NameCardCaptureCreateRequest;

public final class NameCardCaptureCreateValidator {

    public void validateOrThrow(final NameCardCaptureCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("NCM_VAL_CAPTURE_CREATE_REQUEST_REQUIRED");
        }
        if (request.actorUserId == null) {
            throw new IllegalArgumentException("NCM_VAL_ACTOR_USER_ID_REQUIRED");
        }
        if (request.captureSourceType == null || request.captureSourceType.trim().isEmpty()) {
            throw new IllegalArgumentException("NCM_VAL_CAPTURE_SOURCE_TYPE_REQUIRED");
        }
        if (request.originalFileName == null || request.originalFileName.trim().isEmpty()) {
            throw new IllegalArgumentException("NCM_VAL_ORIGINAL_FILE_NAME_REQUIRED");
        }
        if (request.mimeType == null || request.mimeType.trim().isEmpty()) {
            throw new IllegalArgumentException("NCM_VAL_MIME_TYPE_REQUIRED");
        }
        if (request.fileSizeBytes == null || request.fileSizeBytes.longValue() <= 0L) {
            throw new IllegalArgumentException("NCM_VAL_FILE_SIZE_INVALID");
        }
        if (request.createImageStagingRow == null) {
            throw new IllegalArgumentException("NCM_VAL_CREATE_IMAGE_STAGING_ROW_REQUIRED");
        }
        if (request.requestOcrLater == null) {
            throw new IllegalArgumentException("NCM_VAL_REQUEST_OCR_LATER_REQUIRED");
        }
    }
}
