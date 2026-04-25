package com.lsam.NameCardManager.smoke;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.lsam.NameCardManager.domain.port.audit.NameCardManagerAuditPort;

public final class FakeNameCardManagerAuditPort implements NameCardManagerAuditPort {

    public final List<String> logs = new ArrayList<>();

    @Override
    public void appendRelationshipQueryAudit(
            final UUID requesterUserId,
            final UUID sourceNamecardId,
            final int resultCount,
            final OffsetDateTime occurredAt
    ) {
        logs.add("relationship:" + requesterUserId + ":" + sourceNamecardId + ":" + resultCount + ":" + occurredAt);
    }

    @Override
    public void appendCompanyTimelineQueryAudit(
            final UUID requesterUserId,
            final UUID companyId,
            final int resultCount,
            final OffsetDateTime occurredAt
    ) {
        logs.add("companytimeline:" + requesterUserId + ":" + companyId + ":" + resultCount + ":" + occurredAt);
    }

    @Override
    public void appendCaptureSessionCreatedAudit(
            final UUID actorUserId,
            final UUID captureSessionId,
            final String captureStateCode,
            final OffsetDateTime occurredAt
    ) {
        logs.add("captureCreated:" + actorUserId + ":" + captureSessionId + ":" + captureStateCode + ":" + occurredAt);
    }

    @Override
    public void appendImageStagingRegisteredAudit(
            final UUID actorUserId,
            final UUID captureSessionId,
            final UUID imageStagingId,
            final String stagingStateCode,
            final OffsetDateTime occurredAt
    ) {
        logs.add("imageStaging:" + actorUserId + ":" + captureSessionId + ":" + imageStagingId + ":" + stagingStateCode + ":" + occurredAt);
    }
}
