package com.lsam.NameCardManager.application.validator.companytimeline;

import com.lsam.NameCardManager.api.dto.companytimeline.request.CompanyTimelineQueryRequest;

public final class CompanyTimelineQueryValidator {

    public void validateOrThrow(final CompanyTimelineQueryRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("NCM_VAL_COMPANY_TIMELINE_QUERY_REQUEST_REQUIRED");
        }
        if (request.companyId == null) {
            throw new IllegalArgumentException("NCM_VAL_COMPANY_ID_REQUIRED");
        }
        if (request.pageSize == null) {
            throw new IllegalArgumentException("NCM_VAL_PAGE_SIZE_REQUIRED");
        }
        if (request.pageSize.intValue() <= 0) {
            throw new IllegalArgumentException("NCM_VAL_PAGE_SIZE_INVALID");
        }
        if (request.pageSize.intValue() > 200) {
            throw new IllegalArgumentException("NCM_VAL_PAGE_SIZE_TOO_LARGE");
        }
        if (request.includeInternalEvents == null) {
            throw new IllegalArgumentException("NCM_VAL_INCLUDE_INTERNAL_EVENTS_REQUIRED");
        }
        if (request.includeExternalEvents == null) {
            throw new IllegalArgumentException("NCM_VAL_INCLUDE_EXTERNAL_EVENTS_REQUIRED");
        }
        if (request.includeUnconfirmed == null) {
            throw new IllegalArgumentException("NCM_VAL_INCLUDE_UNCONFIRMED_REQUIRED");
        }
    }
}
