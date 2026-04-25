package com.lsam.PocketSecretary.application.service.briefing;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.lsam.PocketSecretary.api.dto.briefing.request.BriefingQueryRequest;
import com.lsam.PocketSecretary.api.dto.briefing.response.BriefingQueryResponse;
import com.lsam.PocketSecretary.application.mapper.briefing.BriefingQueryMapper;
import com.lsam.PocketSecretary.application.validator.briefing.BriefingQueryValidator;
import com.lsam.PocketSecretary.domain.model.briefing.BriefingItem;
import com.lsam.PocketSecretary.domain.model.briefing.BriefingQueryCriteria;
import com.lsam.PocketSecretary.domain.port.audit.PocketSecretaryAuditPort;
import com.lsam.PocketSecretary.domain.port.briefing.BriefingQueryRepository;

public final class BriefingQueryService {

    private final BriefingQueryValidator validator;
    private final BriefingQueryMapper mapper;
    private final BriefingQueryRepository repository;
    private final PocketSecretaryAuditPort auditPort;

    public BriefingQueryService(
            final BriefingQueryValidator validator,
            final BriefingQueryMapper mapper,
            final BriefingQueryRepository repository,
            final PocketSecretaryAuditPort auditPort
    ) {
        this.validator = validator;
        this.mapper = mapper;
        this.repository = repository;
        this.auditPort = auditPort;
    }

    public BriefingQueryResponse query(
            final UUID requesterUserId,
            final BriefingQueryRequest request
    ) {
        validator.validateOrThrow(request);

        final BriefingQueryCriteria criteria = mapper.toCriteria(request);
        final List<BriefingItem> items = repository.findBriefingItems(criteria);
        final String nextPageToken = repository.findNextPageToken(criteria, items.size());

        auditPort.appendBriefingQueryAudit(
                requesterUserId,
                criteria.userId,
                items.size(),
                OffsetDateTime.now()
        );

        return mapper.toResponse(criteria, items, nextPageToken);
    }
}
