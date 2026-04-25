package com.lsam.NameCardManager.api.payload.capture;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class NameCardCaptureCreateResponsePayload {
    public boolean success;
    public UUID captureSessionId;
    public String captureStateCode;
    public Boolean imageStagingCreated;
    public String uploadInstruction;
    public String storageScope;
    public OffsetDateTime createdAt;
    public String errorCode;
    public String errorMessage;
}
