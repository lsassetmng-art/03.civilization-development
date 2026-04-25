package com.lsam.PocketSecretary.infrastructure.repository.conversationaction;

import com.lsam.PocketSecretary.domain.model.conversationaction.ConversationActionItem;
import com.lsam.PocketSecretary.domain.port.conversationaction.ConversationActionRepository;

public final class JdbcConversationActionRepository implements ConversationActionRepository {

    @Override
    public ConversationActionItem createConversationAction(final ConversationActionItem item) {
        // TODO: additive-only conversation-to-action write persistence after row family and SQL support are fixed.
        return item;
    }
}
