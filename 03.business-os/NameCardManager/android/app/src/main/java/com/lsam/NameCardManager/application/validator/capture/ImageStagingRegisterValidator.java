package com.lsam.NameCardManager.application.validator.capture;

import com.lsam.NameCardManager.api.dto.capture.request.ImageStagingRegisterRequest;

public final class ImageStagingRegisterValidator {

    public void validateOrThrow(final ImageStagingRegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("NCM_VAL_IMAGE_STAGING_REQUEST_REQUIRED");
        }
        if (request.captureSessionId == null) {
            throw new IllegalArgumentException("NCM_VAL_CAPTURE_SESSION_ID_REQUIRED");
        }
        if (request.actorUserId == null) {
            throw new IllegalArgumentException("NCM_VAL_ACTOR_USER_ID_REQUIRED");
        }
        if (request.stagingObjectKey == null || request.stagingObjectKey.trim().isEmpty()) {
            throw new IllegalArgumentException("NCM_VAL_STAGING_OBJECT_KEY_REQUIRED");
        }
        if (request.imageRoleType == null || request.imageRoleType.trim().isEmpty()) {
            throw new IllegalArgumentException("NCM_VAL_IMAGE_ROLE_TYPE_REQUIRED");
        }
        if (request.pageIndex == null || request.pageIndex.intValue() < 0) {
            throw new IllegalArgumentException("NCM_VAL_PAGE_INDEX_INVALID");
        }
        if (request.displayOrder == null || request.displayOrder.intValue() < 0) {
            throw new IllegalArgumentException("NCM_VAL_DISPLAY_ORDER_INVALID");
        }
    }
}
