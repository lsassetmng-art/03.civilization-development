package com.lsam.NameCardManager.api.controller.capture;

import com.lsam.NameCardManager.api.dto.capture.request.ImageStagingRegisterRequest;
import com.lsam.NameCardManager.api.dto.capture.request.NameCardCaptureCreateRequest;
import com.lsam.NameCardManager.api.dto.capture.response.ImageStagingRegisterResponse;
import com.lsam.NameCardManager.api.dto.capture.response.NameCardCaptureCreateResponse;
import com.lsam.NameCardManager.application.service.capture.CaptureImageStagingService;

public final class NameCardCaptureController {

    private final CaptureImageStagingService service;

    public NameCardCaptureController(final CaptureImageStagingService service) {
        this.service = service;
    }

    public NameCardCaptureCreateResponse createCaptureSession(final NameCardCaptureCreateRequest request) {
        return service.createCaptureSession(request);
    }

    public ImageStagingRegisterResponse registerImageStaging(final ImageStagingRegisterRequest request) {
        return service.registerImageStaging(request);
    }
}
