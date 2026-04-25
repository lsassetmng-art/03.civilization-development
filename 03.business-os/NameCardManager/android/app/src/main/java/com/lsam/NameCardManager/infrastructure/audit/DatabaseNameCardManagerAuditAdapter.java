package com.lsam.NameCardManager.infrastructure.audit;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.logging.Logger;
import javax.sql.DataSource;

import com.lsam.NameCardManager.domain.port.audit.NameCardManagerAuditPort;

public final class DatabaseNameCardManagerAuditAdapter implements NameCardManagerAuditPort {

    private static final Logger LOGGER = Logger.getLogger(DatabaseNameCardManagerAuditAdapter.class.getName());

    private final DataSource dataSource;

    public DatabaseNameCardManagerAuditAdapter() {
        this(null);
    }

    public DatabaseNameCardManagerAuditAdapter(final DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void appendRelationshipQueryAudit(
            final UUID requesterUserId,
            final UUID sourceNamecardId,
            final int resultCount,
            final OffsetDateTime occurredAt
    ) {
        logDeferredAudit(
                "relationship_query",
                requesterUserId,
                sourceNamecardId,
                null,
                resultCount,
                occurredAt
        );
    }

    @Override
    public void appendCompanyTimelineQueryAudit(
            final UUID requesterUserId,
            final UUID companyId,
            final int resultCount,
            final OffsetDateTime occurredAt
    ) {
        logDeferredAudit(
                "company_timeline_query",
                requesterUserId,
                companyId,
                null,
                resultCount,
                occurredAt
        );
    }

    @Override
    public void appendCaptureSessionCreatedAudit(
            final UUID actorUserId,
            final UUID captureSessionId,
            final String captureStateCode,
            final OffsetDateTime occurredAt
    ) {
        LOGGER.info(
                "NCM_AUDIT_CAPTURE_SESSION_CREATED actorUserId=" + actorUserId +
                " captureSessionId=" + captureSessionId +
                " captureStateCode=" + captureStateCode +
                " occurredAt=" + occurredAt +
                " datasourceConfigured=" + (dataSource != null)
        );
    }

    @Override
    public void appendImageStagingRegisteredAudit(
            final UUID actorUserId,
            final UUID captureSessionId,
            final UUID imageStagingId,
            final String stagingStateCode,
            final OffsetDateTime occurredAt
    ) {
        LOGGER.info(
                "NCM_AUDIT_IMAGE_STAGING_REGISTERED actorUserId=" + actorUserId +
                " captureSessionId=" + captureSessionId +
                " imageStagingId=" + imageStagingId +
                " stagingStateCode=" + stagingStateCode +
                " occurredAt=" + occurredAt +
                " datasourceConfigured=" + (dataSource != null)
        );
    }

    private void logDeferredAudit(
            final String auditType,
            final UUID actorUserId,
            final UUID primaryTargetId,
            final UUID secondaryTargetId,
            final int resultCount,
            final OffsetDateTime occurredAt
    ) {
        LOGGER.info(
                "NCM_AUDIT_DEFERRED auditType=" + auditType +
                " actorUserId=" + actorUserId +
                " primaryTargetId=" + primaryTargetId +
                " secondaryTargetId=" + secondaryTargetId +
                " resultCount=" + resultCount +
                " occurredAt=" + occurredAt +
                " datasourceConfigured=" + (dataSource != null)
        );
    }
}
