package com.lsam.PocketSecretary.config.briefing;

import com.lsam.PocketSecretary.api.controller.briefing.BriefingQueryController;
import com.lsam.PocketSecretary.application.mapper.briefing.BriefingQueryMapper;
import com.lsam.PocketSecretary.application.service.briefing.BriefingQueryService;
import com.lsam.PocketSecretary.application.validator.briefing.BriefingQueryValidator;
import com.lsam.PocketSecretary.infrastructure.audit.DatabasePocketSecretaryAuditAdapter;
import com.lsam.PocketSecretary.infrastructure.repository.briefing.JdbcBriefingQueryRepository;

public final class PocketSecretaryBriefingQueryConfig {

    public BriefingQueryController briefingQueryController() {
        return new BriefingQueryController(
                new BriefingQueryService(
                        new BriefingQueryValidator(),
                        new BriefingQueryMapper(),
                        new JdbcBriefingQueryRepository(),
                        new DatabasePocketSecretaryAuditAdapter()
                )
        );
    }
}
