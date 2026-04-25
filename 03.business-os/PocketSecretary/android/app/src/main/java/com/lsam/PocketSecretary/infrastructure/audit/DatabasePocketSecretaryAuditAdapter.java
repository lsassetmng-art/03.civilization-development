package com.lsam.PocketSecretary.infrastructure.audit;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.lsam.PocketSecretary.domain.port.audit.PocketSecretaryAuditPort;

public final class DatabasePocketSecretaryAuditAdapter implements PocketSecretaryAuditPort {

    @Override
    public void appendBriefingQueryAudit(
            final UUID requesterUserId,
            final UUID targetUserId,
            final int resultCount,
            final OffsetDateTime occurredAt
    ) {
        // TODO: append-only audit persistence for briefing query.
    }

    @Override
    public void appendFollowThroughQueueQueryAudit(
            final UUID requesterUserId,
            final UUID targetUserId,
            final int resultCount,
            final OffsetDateTime occurredAt
    ) {
        // TODO: append-only audit persistence for follow-through queue query.
    }

    @Override
    public void appendConversationActionCreateAudit(
            final UUID actorUserId,
            final UUID targetUserId,
            final UUID conversationId,
            final UUID actionId,
            final String actionStateCode,
            final OffsetDateTime occurredAt
    ) {
        // TODO: append-only audit persistence for conversation action create.
    }
}
