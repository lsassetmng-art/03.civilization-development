package com.lsam.NameCardManager.api.controller.relationship;

import java.util.UUID;

import com.lsam.NameCardManager.api.dto.relationship.request.RelationshipQueryRequest;
import com.lsam.NameCardManager.api.dto.relationship.response.RelationshipQueryResponse;
import com.lsam.NameCardManager.application.service.relationship.RelationshipQueryService;

public final class RelationshipQueryController {

    private final RelationshipQueryService service;

    public RelationshipQueryController(final RelationshipQueryService service) {
        this.service = service;
    }

    public RelationshipQueryResponse query(
            final UUID requesterUserId,
            final RelationshipQueryRequest request
    ) {
        return service.query(requesterUserId, request);
    }
}
