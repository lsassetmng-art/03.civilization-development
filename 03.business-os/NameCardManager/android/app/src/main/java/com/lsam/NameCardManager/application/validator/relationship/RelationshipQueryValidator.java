package com.lsam.NameCardManager.application.validator.relationship;

import com.lsam.NameCardManager.api.dto.relationship.request.RelationshipQueryRequest;

public final class RelationshipQueryValidator {

    public void validateOrThrow(final RelationshipQueryRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("NCM_VAL_RELATIONSHIP_QUERY_REQUEST_REQUIRED");
        }
        if (request.sourceNamecardId == null) {
            throw new IllegalArgumentException("NCM_VAL_SOURCE_NAMECARD_ID_REQUIRED");
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
        if (request.includeUnconfirmed == null) {
            throw new IllegalArgumentException("NCM_VAL_INCLUDE_UNCONFIRMED_REQUIRED");
        }
        if (request.includeSameCompany == null) {
            throw new IllegalArgumentException("NCM_VAL_INCLUDE_SAME_COMPANY_REQUIRED");
        }
        if (request.includeExternalTargets == null) {
            throw new IllegalArgumentException("NCM_VAL_INCLUDE_EXTERNAL_TARGETS_REQUIRED");
        }
    }
}
