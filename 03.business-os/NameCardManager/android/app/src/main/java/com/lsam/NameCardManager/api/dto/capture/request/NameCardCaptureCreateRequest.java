package com.lsam.NameCardManager.api.dto.capture.request;

import java.util.UUID;

public final class NameCardCaptureCreateRequest {
    public UUID actorUserId;
    public String captureSourceType;
    public String originalFileName;
    public String mimeType;
    public Long fileSizeBytes;
    public Boolean createImageStagingRow;
    public Boolean requestOcrLater;
    public String clientRequestId;
}
