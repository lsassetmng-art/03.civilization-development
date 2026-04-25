package com.lsam.NameCardManager.api.controller.companytimeline;

import java.util.UUID;

import com.lsam.NameCardManager.api.dto.companytimeline.request.CompanyTimelineQueryRequest;
import com.lsam.NameCardManager.api.dto.companytimeline.response.CompanyTimelineQueryResponse;
import com.lsam.NameCardManager.application.service.companytimeline.CompanyTimelineQueryService;

public final class CompanyTimelineQueryController {

    private final CompanyTimelineQueryService service;

    public CompanyTimelineQueryController(final CompanyTimelineQueryService service) {
        this.service = service;
    }

    public CompanyTimelineQueryResponse query(
            final UUID requesterUserId,
            final CompanyTimelineQueryRequest request
    ) {
        return service.query(requesterUserId, request);
    }
}
