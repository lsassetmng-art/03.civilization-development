package com.lsam.NameCardManager.domain.model.capture;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class NameCardCaptureSession {
    public UUID captureSessionId;
    public UUID actorUserId;
    public String captureSourceType;
    public String captureStateCode;
    public String originalFileName;
    public String mimeType;
    public Long fileSizeBytes;
    public Boolean requestOcrLater;
    public String appShareBoundaryCode;
    public String erpPublicationBoundaryCode;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;
}
