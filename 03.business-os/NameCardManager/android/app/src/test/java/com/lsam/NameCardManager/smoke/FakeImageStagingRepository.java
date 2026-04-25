package com.lsam.NameCardManager.smoke;

import com.lsam.NameCardManager.domain.model.capture.ImageStagingItem;
import com.lsam.NameCardManager.domain.port.capture.ImageStagingRepository;

public final class FakeImageStagingRepository implements ImageStagingRepository {

    @Override
    public ImageStagingItem registerImageStaging(final ImageStagingItem item) {
        return item;
    }
}
