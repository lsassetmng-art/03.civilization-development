package com.lsam.NameCardManager.application.mapper.capture;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.lsam.NameCardManager.api.dto.capture.request.ImageStagingRegisterRequest;
import com.lsam.NameCardManager.api.dto.capture.request.NameCardCaptureCreateRequest;
import com.lsam.NameCardManager.api.dto.capture.response.ImageStagingRegisterResponse;
import com.lsam.NameCardManager.api.dto.capture.response.NameCardCaptureCreateResponse;
import com.lsam.NameCardManager.domain.model.capture.ImageStagingItem;
import com.lsam.NameCardManager.domain.model.capture.NameCardCaptureSession;

public final class CaptureImageStagingMapper {

    public NameCardCaptureSession toCaptureSession(final NameCardCaptureCreateRequest request) {
        final NameCardCaptureSession session = new NameCardCaptureSession();
        session.captureSessionId = UUID.randomUUID();
        session.actorUserId = request.actorUserId;
        session.captureSourceType = request.captureSourceType;
        session.captureStateCode = "staging_pending";
        session.originalFileName = request.originalFileName;
        session.mimeType = request.mimeType;
        session.fileSizeBytes = request.fileSizeBytes;
        session.requestOcrLater = request.requestOcrLater;
        session.appShareBoundaryCode = "app_share_only";
        session.erpPublicationBoundaryCode = "not_published_to_erp";
        session.createdAt = OffsetDateTime.now();
        session.updatedAt = session.createdAt;
        return session;
    }

    public ImageStagingItem toImageStagingItem(final ImageStagingRegisterRequest request) {
        final ImageStagingItem item = new ImageStagingItem();
        item.imageStagingId = UUID.randomUUID();
        item.captureSessionId = request.captureSessionId;
        item.actorUserId = request.actorUserId;
        item.stagingObjectKey = request.stagingObjectKey;
        item.stagingStateCode = "registered";
        item.imageRoleType = request.imageRoleType;
        item.pageIndex = request.pageIndex;
        item.displayOrder = request.displayOrder;
        item.widthPx = request.widthPx;
        item.heightPx = request.heightPx;
        item.checksumSha256 = request.checksumSha256;
        item.createdAt = OffsetDateTime.now();
        item.updatedAt = item.createdAt;
        return item;
    }

    public NameCardCaptureCreateResponse toCaptureCreateResponse(final NameCardCaptureSession session) {
        final NameCardCaptureCreateResponse response = new NameCardCaptureCreateResponse();
        response.captureSessionId = session.captureSessionId;
        response.captureStateCode = session.captureStateCode;
        response.imageStagingCreated = Boolean.TRUE;
        response.uploadInstruction = "Upload original image to the staging scope before OCR or publication review.";
        response.storageScope = session.appShareBoundaryCode;
        response.createdAt = session.createdAt;
        return response;
    }

    public ImageStagingRegisterResponse toImageStagingResponse(final ImageStagingItem item) {
        final ImageStagingRegisterResponse response = new ImageStagingRegisterResponse();
        response.imageStagingId = item.imageStagingId;
        response.captureSessionId = item.captureSessionId;
        response.stagingStateCode = item.stagingStateCode;
        response.imageRoleType = item.imageRoleType;
        response.pageIndex = item.pageIndex;
        response.registeredAt = item.createdAt;
        return response;
    }
}
