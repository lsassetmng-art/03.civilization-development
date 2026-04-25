package com.lsam.PocketSecretary.application.service.followthrough;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.lsam.PocketSecretary.api.dto.followthrough.request.FollowThroughQueueQueryRequest;
import com.lsam.PocketSecretary.api.dto.followthrough.response.FollowThroughQueueQueryResponse;
import com.lsam.PocketSecretary.application.mapper.followthrough.FollowThroughQueueQueryMapper;
import com.lsam.PocketSecretary.application.validator.followthrough.FollowThroughQueueQueryValidator;
import com.lsam.PocketSecretary.domain.model.followthrough.FollowThroughQueueItem;
import com.lsam.PocketSecretary.domain.model.followthrough.FollowThroughQueueQueryCriteria;
import com.lsam.PocketSecretary.domain.port.audit.PocketSecretaryAuditPort;
import com.lsam.PocketSecretary.domain.port.followthrough.FollowThroughQueueRepository;

public final class FollowThroughQueueQueryService {

    private final FollowThroughQueueQueryValidator validator;
    private final FollowThroughQueueQueryMapper mapper;
    private final FollowThroughQueueRepository repository;
    private final PocketSecretaryAuditPort auditPort;

    public FollowThroughQueueQueryService(
            final FollowThroughQueueQueryValidator validator,
            final FollowThroughQueueQueryMapper mapper,
            final FollowThroughQueueRepository repository,
            final PocketSecretaryAuditPort auditPort
    ) {
        this.validator = validator;
        this.mapper = mapper;
        this.repository = repository;
        this.auditPort = auditPort;
    }

    public FollowThroughQueueQueryResponse query(
            final UUID requesterUserId,
            final FollowThroughQueueQueryRequest request
    ) {
        validator.validateOrThrow(request);

        final FollowThroughQueueQueryCriteria criteria = mapper.toCriteria(request);
        final List<FollowThroughQueueItem> items = repository.findQueueItems(criteria);
        final String nextPageToken = repository.findNextPageToken(criteria, items.size());

        auditPort.appendFollowThroughQueueQueryAudit(
                requesterUserId,
                criteria.userId,
                items.size(),
                OffsetDateTime.now()
        );

        return mapper.toResponse(criteria, items, nextPageToken);
    }
}
