package com.lsam.NameCardManager.application.service.capture;

import java.time.OffsetDateTime;

import com.lsam.NameCardManager.api.dto.capture.request.ImageStagingRegisterRequest;
import com.lsam.NameCardManager.api.dto.capture.request.NameCardCaptureCreateRequest;
import com.lsam.NameCardManager.api.dto.capture.response.ImageStagingRegisterResponse;
import com.lsam.NameCardManager.api.dto.capture.response.NameCardCaptureCreateResponse;
import com.lsam.NameCardManager.application.mapper.capture.CaptureImageStagingMapper;
import com.lsam.NameCardManager.application.validator.capture.ImageStagingRegisterValidator;
import com.lsam.NameCardManager.application.validator.capture.NameCardCaptureCreateValidator;
import com.lsam.NameCardManager.domain.model.capture.ImageStagingItem;
import com.lsam.NameCardManager.domain.model.capture.NameCardCaptureSession;
import com.lsam.NameCardManager.domain.port.audit.NameCardManagerAuditPort;
import com.lsam.NameCardManager.domain.port.capture.ImageStagingRepository;
import com.lsam.NameCardManager.domain.port.capture.NameCardCaptureSessionRepository;

public final class CaptureImageStagingService {

    private final NameCardCaptureCreateValidator captureCreateValidator;
    private final ImageStagingRegisterValidator imageStagingRegisterValidator;
    private final CaptureImageStagingMapper mapper;
    private final NameCardCaptureSessionRepository captureSessionRepository;
    private final ImageStagingRepository imageStagingRepository;
    private final NameCardManagerAuditPort auditPort;

    public CaptureImageStagingService(
            final NameCardCaptureCreateValidator captureCreateValidator,
            final ImageStagingRegisterValidator imageStagingRegisterValidator,
            final CaptureImageStagingMapper mapper,
            final NameCardCaptureSessionRepository captureSessionRepository,
            final ImageStagingRepository imageStagingRepository,
            final NameCardManagerAuditPort auditPort
    ) {
        this.captureCreateValidator = captureCreateValidator;
        this.imageStagingRegisterValidator = imageStagingRegisterValidator;
        this.mapper = mapper;
        this.captureSessionRepository = captureSessionRepository;
        this.imageStagingRepository = imageStagingRepository;
        this.auditPort = auditPort;
    }

    public NameCardCaptureCreateResponse createCaptureSession(final NameCardCaptureCreateRequest request) {
        captureCreateValidator.validateOrThrow(request);

        final NameCardCaptureSession session = mapper.toCaptureSession(request);
        final NameCardCaptureSession stored = captureSessionRepository.createCaptureSession(session);

        auditPort.appendCaptureSessionCreatedAudit(
                stored.actorUserId,
                stored.captureSessionId,
                stored.captureStateCode,
                OffsetDateTime.now()
        );

        return mapper.toCaptureCreateResponse(stored);
    }

    public ImageStagingRegisterResponse registerImageStaging(final ImageStagingRegisterRequest request) {
        imageStagingRegisterValidator.validateOrThrow(request);

        final ImageStagingItem item = mapper.toImageStagingItem(request);
        final ImageStagingItem stored = imageStagingRepository.registerImageStaging(item);

        auditPort.appendImageStagingRegisteredAudit(
                stored.actorUserId,
                stored.captureSessionId,
                stored.imageStagingId,
                stored.stagingStateCode,
                OffsetDateTime.now()
        );

        return mapper.toImageStagingResponse(stored);
    }
}
