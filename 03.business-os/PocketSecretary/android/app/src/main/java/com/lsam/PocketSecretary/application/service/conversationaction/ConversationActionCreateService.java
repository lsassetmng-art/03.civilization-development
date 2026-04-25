package com.lsam.PocketSecretary.application.service.conversationaction;

import java.time.OffsetDateTime;

import com.lsam.PocketSecretary.api.dto.conversationaction.request.ConversationActionCreateRequest;
import com.lsam.PocketSecretary.api.dto.conversationaction.response.ConversationActionCreateResponse;
import com.lsam.PocketSecretary.application.mapper.conversationaction.ConversationActionCreateMapper;
import com.lsam.PocketSecretary.application.validator.conversationaction.ConversationActionCreateValidator;
import com.lsam.PocketSecretary.domain.model.conversationaction.ConversationActionItem;
import com.lsam.PocketSecretary.domain.port.audit.PocketSecretaryAuditPort;
import com.lsam.PocketSecretary.domain.port.conversationaction.ConversationActionRepository;

public final class ConversationActionCreateService {

    private final ConversationActionCreateValidator validator;
    private final ConversationActionCreateMapper mapper;
    private final ConversationActionRepository repository;
    private final PocketSecretaryAuditPort auditPort;

    public ConversationActionCreateService(
            final ConversationActionCreateValidator validator,
            final ConversationActionCreateMapper mapper,
            final ConversationActionRepository repository,
            final PocketSecretaryAuditPort auditPort
    ) {
        this.validator = validator;
        this.mapper = mapper;
        this.repository = repository;
        this.auditPort = auditPort;
    }

    public ConversationActionCreateResponse create(final ConversationActionCreateRequest request) {
        validator.validateOrThrow(request);

        final ConversationActionItem item = mapper.toDomain(request);
        final ConversationActionItem stored = repository.createConversationAction(item);

        auditPort.appendConversationActionCreateAudit(
                stored.actorUserId,
                stored.targetUserId,
                stored.conversationId,
                stored.actionId,
                stored.actionStateCode,
                OffsetDateTime.now()
        );

        return mapper.toResponse(stored);
    }
}
