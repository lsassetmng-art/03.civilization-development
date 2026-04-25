package com.lsam.PocketSecretary.api.controller.followthrough;

import java.util.UUID;

import com.lsam.PocketSecretary.api.dto.followthrough.request.FollowThroughQueueQueryRequest;
import com.lsam.PocketSecretary.api.dto.followthrough.response.FollowThroughQueueQueryResponse;
import com.lsam.PocketSecretary.application.service.followthrough.FollowThroughQueueQueryService;

public final class FollowThroughQueueQueryController {

    private final FollowThroughQueueQueryService service;

    public FollowThroughQueueQueryController(final FollowThroughQueueQueryService service) {
        this.service = service;
    }

    public FollowThroughQueueQueryResponse query(
            final UUID requesterUserId,
            final FollowThroughQueueQueryRequest request
    ) {
        return service.query(requesterUserId, request);
    }
}
