package com.lsam.NameCardManager.api.dto.capture.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class ImageStagingRegisterResponse {
    public UUID imageStagingId;
    public UUID captureSessionId;
    public String stagingStateCode;
    public String imageRoleType;
    public Integer pageIndex;
    public OffsetDateTime registeredAt;
}
