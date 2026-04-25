package com.lsam.NameCardManager.domain.port.capture;

import com.lsam.NameCardManager.domain.model.capture.ImageStagingItem;

public interface ImageStagingRepository {
    ImageStagingItem registerImageStaging(ImageStagingItem item);
}
