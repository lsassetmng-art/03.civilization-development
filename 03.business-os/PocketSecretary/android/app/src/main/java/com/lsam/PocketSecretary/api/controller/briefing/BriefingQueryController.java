package com.lsam.PocketSecretary.api.controller.briefing;

import java.util.UUID;

import com.lsam.PocketSecretary.api.dto.briefing.request.BriefingQueryRequest;
import com.lsam.PocketSecretary.api.dto.briefing.response.BriefingQueryResponse;
import com.lsam.PocketSecretary.application.service.briefing.BriefingQueryService;

public final class BriefingQueryController {

    private final BriefingQueryService service;

    public BriefingQueryController(final BriefingQueryService service) {
        this.service = service;
    }

    public BriefingQueryResponse query(
            final UUID requesterUserId,
            final BriefingQueryRequest request
    ) {
        return service.query(requesterUserId, request);
    }
}
