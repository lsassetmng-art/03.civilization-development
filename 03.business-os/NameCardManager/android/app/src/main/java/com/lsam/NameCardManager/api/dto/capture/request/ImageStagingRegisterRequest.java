package com.lsam.NameCardManager.api.dto.capture.request;

import java.util.UUID;

public final class ImageStagingRegisterRequest {
    public UUID captureSessionId;
    public UUID actorUserId;
    public String stagingObjectKey;
    public String imageRoleType;
    public Integer pageIndex;
    public Integer displayOrder;
    public Integer widthPx;
    public Integer heightPx;
    public String checksumSha256;
}
