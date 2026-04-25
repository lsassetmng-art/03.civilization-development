package com.lsam.PocketSecretary.config.followthrough;

import com.lsam.PocketSecretary.api.controller.followthrough.FollowThroughQueueQueryController;
import com.lsam.PocketSecretary.application.mapper.followthrough.FollowThroughQueueQueryMapper;
import com.lsam.PocketSecretary.application.service.followthrough.FollowThroughQueueQueryService;
import com.lsam.PocketSecretary.application.validator.followthrough.FollowThroughQueueQueryValidator;
import com.lsam.PocketSecretary.infrastructure.audit.DatabasePocketSecretaryAuditAdapter;
import com.lsam.PocketSecretary.infrastructure.repository.followthrough.JdbcFollowThroughQueueRepository;

public final class PocketSecretaryFollowThroughQueueConfig {

    public FollowThroughQueueQueryController followThroughQueueQueryController() {
        return new FollowThroughQueueQueryController(
                new FollowThroughQueueQueryService(
                        new FollowThroughQueueQueryValidator(),
                        new FollowThroughQueueQueryMapper(),
                        new JdbcFollowThroughQueueRepository(),
                        new DatabasePocketSecretaryAuditAdapter()
                )
        );
    }
}
