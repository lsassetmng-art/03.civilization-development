package com.lsam.NameCardManager.config.capture;

import javax.sql.DataSource;

import com.lsam.NameCardManager.api.controller.capture.NameCardCaptureController;
import com.lsam.NameCardManager.application.mapper.capture.CaptureImageStagingMapper;
import com.lsam.NameCardManager.application.service.capture.CaptureImageStagingService;
import com.lsam.NameCardManager.application.validator.capture.ImageStagingRegisterValidator;
import com.lsam.NameCardManager.application.validator.capture.NameCardCaptureCreateValidator;
import com.lsam.NameCardManager.infrastructure.audit.DatabaseNameCardManagerAuditAdapter;
import com.lsam.NameCardManager.infrastructure.repository.capture.JdbcImageStagingRepository;
import com.lsam.NameCardManager.infrastructure.repository.capture.JdbcNameCardCaptureSessionRepository;

public final class NameCardCaptureImageStagingConfig {

    private final DataSource dataSource;

    public NameCardCaptureImageStagingConfig() {
        this(null);
    }

    public NameCardCaptureImageStagingConfig(final DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public NameCardCaptureController nameCardCaptureController() {
        return new NameCardCaptureController(
                new CaptureImageStagingService(
                        new NameCardCaptureCreateValidator(),
                        new ImageStagingRegisterValidator(),
                        new CaptureImageStagingMapper(),
                        new JdbcNameCardCaptureSessionRepository(dataSource),
                        new JdbcImageStagingRepository(dataSource),
                        new DatabaseNameCardManagerAuditAdapter(dataSource)
                )
        );
    }
}
