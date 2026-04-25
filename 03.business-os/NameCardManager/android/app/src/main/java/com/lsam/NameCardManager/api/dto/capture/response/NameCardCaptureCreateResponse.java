package com.lsam.NameCardManager.api.dto.capture.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class NameCardCaptureCreateResponse {
    public UUID captureSessionId;
    public String captureStateCode;
    public Boolean imageStagingCreated;
    public String uploadInstruction;
    public String storageScope;
    public OffsetDateTime createdAt;
}
