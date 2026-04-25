package com.lsam.PocketSecretary.domain.port.audit;

import java.time.OffsetDateTime;
import java.util.UUID;

public interface PocketSecretaryAuditPort {
    void appendBriefingQueryAudit(
            UUID requesterUserId,
            UUID targetUserId,
            int resultCount,
            OffsetDateTime occurredAt
    );

    void appendFollowThroughQueueQueryAudit(
            UUID requesterUserId,
            UUID targetUserId,
            int resultCount,
            OffsetDateTime occurredAt
    );

    void appendConversationActionCreateAudit(
            UUID actorUserId,
            UUID targetUserId,
            UUID conversationId,
            UUID actionId,
            String actionStateCode,
            OffsetDateTime occurredAt
    );
}
