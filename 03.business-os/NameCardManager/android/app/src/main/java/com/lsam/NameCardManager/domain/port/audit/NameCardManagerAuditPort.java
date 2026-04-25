package com.lsam.NameCardManager.domain.port.audit;

import java.time.OffsetDateTime;
import java.util.UUID;

public interface NameCardManagerAuditPort {
    void appendRelationshipQueryAudit(
            UUID requesterUserId,
            UUID sourceNamecardId,
            int resultCount,
            OffsetDateTime occurredAt
    );

    void appendCompanyTimelineQueryAudit(
            UUID requesterUserId,
            UUID companyId,
            int resultCount,
            OffsetDateTime occurredAt
    );

    void appendCaptureSessionCreatedAudit(
            UUID actorUserId,
            UUID captureSessionId,
            String captureStateCode,
            OffsetDateTime occurredAt
    );

    void appendImageStagingRegisteredAudit(
            UUID actorUserId,
            UUID captureSessionId,
            UUID imageStagingId,
            String stagingStateCode,
            OffsetDateTime occurredAt
    );
}
