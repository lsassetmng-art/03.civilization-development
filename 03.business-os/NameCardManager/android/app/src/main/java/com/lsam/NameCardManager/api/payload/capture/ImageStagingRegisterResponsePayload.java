package com.lsam.NameCardManager.api.payload.capture;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class ImageStagingRegisterResponsePayload {
    public boolean success;
    public UUID imageStagingId;
    public UUID captureSessionId;
    public String stagingStateCode;
    public String imageRoleType;
    public Integer pageIndex;
    public OffsetDateTime registeredAt;
    public String errorCode;
    public String errorMessage;
}
