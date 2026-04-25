package com.lsam.NameCardManager.application.service.relationship;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.lsam.NameCardManager.api.dto.relationship.request.RelationshipQueryRequest;
import com.lsam.NameCardManager.api.dto.relationship.response.RelationshipQueryResponse;
import com.lsam.NameCardManager.application.mapper.relationship.RelationshipQueryMapper;
import com.lsam.NameCardManager.application.validator.relationship.RelationshipQueryValidator;
import com.lsam.NameCardManager.domain.model.relationship.RelationshipQueryCriteria;
import com.lsam.NameCardManager.domain.model.relationship.RelationshipVisibilityItem;
import com.lsam.NameCardManager.domain.port.audit.NameCardManagerAuditPort;
import com.lsam.NameCardManager.domain.port.relationship.RelationshipQueryRepository;

public final class RelationshipQueryService {

    private final RelationshipQueryValidator validator;
    private final RelationshipQueryMapper mapper;
    private final RelationshipQueryRepository repository;
    private final NameCardManagerAuditPort auditPort;

    public RelationshipQueryService(
            final RelationshipQueryValidator validator,
            final RelationshipQueryMapper mapper,
            final RelationshipQueryRepository repository,
            final NameCardManagerAuditPort auditPort
    ) {
        this.validator = validator;
        this.mapper = mapper;
        this.repository = repository;
        this.auditPort = auditPort;
    }

    public RelationshipQueryResponse query(
            final UUID requesterUserId,
            final RelationshipQueryRequest request
    ) {
        validator.validateOrThrow(request);

        final RelationshipQueryCriteria criteria = mapper.toCriteria(request);
        final List<RelationshipVisibilityItem> items = repository.findVisibleRelationships(criteria);
        final String nextPageToken = repository.findNextPageToken(criteria, items.size());

        auditPort.appendRelationshipQueryAudit(
                requesterUserId,
                criteria.sourceNamecardId,
                items.size(),
                OffsetDateTime.now()
        );

        return mapper.toResponse(criteria, items, nextPageToken);
    }
}
