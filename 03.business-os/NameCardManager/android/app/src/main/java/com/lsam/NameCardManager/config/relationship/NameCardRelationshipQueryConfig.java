package com.lsam.NameCardManager.config.relationship;

import javax.sql.DataSource;

import com.lsam.NameCardManager.api.controller.relationship.RelationshipQueryController;
import com.lsam.NameCardManager.application.mapper.relationship.RelationshipQueryMapper;
import com.lsam.NameCardManager.application.service.relationship.RelationshipQueryService;
import com.lsam.NameCardManager.application.validator.relationship.RelationshipQueryValidator;
import com.lsam.NameCardManager.infrastructure.audit.DatabaseNameCardManagerAuditAdapter;
import com.lsam.NameCardManager.infrastructure.repository.relationship.JdbcRelationshipQueryRepository;

public final class NameCardRelationshipQueryConfig {

    private final DataSource dataSource;

    public NameCardRelationshipQueryConfig() {
        this(null);
    }

    public NameCardRelationshipQueryConfig(final DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public RelationshipQueryController relationshipQueryController() {
        return new RelationshipQueryController(
                new RelationshipQueryService(
                        new RelationshipQueryValidator(),
                        new RelationshipQueryMapper(),
                        new JdbcRelationshipQueryRepository(dataSource),
                        new DatabaseNameCardManagerAuditAdapter(dataSource)
                )
        );
    }
}
