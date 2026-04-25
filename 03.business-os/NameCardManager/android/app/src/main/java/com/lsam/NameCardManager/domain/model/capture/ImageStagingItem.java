package com.lsam.NameCardManager.domain.model.capture;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class ImageStagingItem {
    public UUID imageStagingId;
    public UUID captureSessionId;
    public UUID actorUserId;
    public String stagingObjectKey;
    public String stagingStateCode;
    public String imageRoleType;
    public Integer pageIndex;
    public Integer displayOrder;
    public Integer widthPx;
    public Integer heightPx;
    public String checksumSha256;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;
}
