package com.lsam.NameCardManager.application.service.companytimeline;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.lsam.NameCardManager.api.dto.companytimeline.request.CompanyTimelineQueryRequest;
import com.lsam.NameCardManager.api.dto.companytimeline.response.CompanyTimelineQueryResponse;
import com.lsam.NameCardManager.application.mapper.companytimeline.CompanyTimelineQueryMapper;
import com.lsam.NameCardManager.application.validator.companytimeline.CompanyTimelineQueryValidator;
import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineItem;
import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineQueryCriteria;
import com.lsam.NameCardManager.domain.port.audit.NameCardManagerAuditPort;
import com.lsam.NameCardManager.domain.port.companytimeline.CompanyTimelineRepository;

public final class CompanyTimelineQueryService {

    private final CompanyTimelineQueryValidator validator;
    private final CompanyTimelineQueryMapper mapper;
    private final CompanyTimelineRepository repository;
    private final NameCardManagerAuditPort auditPort;

    public CompanyTimelineQueryService(
            final CompanyTimelineQueryValidator validator,
            final CompanyTimelineQueryMapper mapper,
            final CompanyTimelineRepository repository,
            final NameCardManagerAuditPort auditPort
    ) {
        this.validator = validator;
        this.mapper = mapper;
        this.repository = repository;
        this.auditPort = auditPort;
    }

    public CompanyTimelineQueryResponse query(
            final UUID requesterUserId,
            final CompanyTimelineQueryRequest request
    ) {
        validator.validateOrThrow(request);

        final CompanyTimelineQueryCriteria criteria = mapper.toCriteria(request);
        final List<CompanyTimelineItem> items = repository.findTimelineItems(criteria);
        final String nextPageToken = repository.findNextPageToken(criteria, items.size());

        auditPort.appendCompanyTimelineQueryAudit(
                requesterUserId,
                criteria.companyId,
                items.size(),
                OffsetDateTime.now()
        );

        return mapper.toResponse(criteria, items, nextPageToken);
    }
}
