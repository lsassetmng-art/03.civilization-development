package com.lsam.NameCardManager.config.companytimeline;

import javax.sql.DataSource;

import com.lsam.NameCardManager.api.controller.companytimeline.CompanyTimelineQueryController;
import com.lsam.NameCardManager.application.mapper.companytimeline.CompanyTimelineQueryMapper;
import com.lsam.NameCardManager.application.service.companytimeline.CompanyTimelineQueryService;
import com.lsam.NameCardManager.application.validator.companytimeline.CompanyTimelineQueryValidator;
import com.lsam.NameCardManager.infrastructure.audit.DatabaseNameCardManagerAuditAdapter;
import com.lsam.NameCardManager.infrastructure.repository.companytimeline.JdbcCompanyTimelineRepository;

public final class NameCardCompanyTimelineQueryConfig {

    private final DataSource dataSource;

    public NameCardCompanyTimelineQueryConfig() {
        this(null);
    }

    public NameCardCompanyTimelineQueryConfig(final DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public CompanyTimelineQueryController companyTimelineQueryController() {
        return new CompanyTimelineQueryController(
                new CompanyTimelineQueryService(
                        new CompanyTimelineQueryValidator(),
                        new CompanyTimelineQueryMapper(),
                        new JdbcCompanyTimelineRepository(dataSource),
                        new DatabaseNameCardManagerAuditAdapter(dataSource)
                )
        );
    }
}
