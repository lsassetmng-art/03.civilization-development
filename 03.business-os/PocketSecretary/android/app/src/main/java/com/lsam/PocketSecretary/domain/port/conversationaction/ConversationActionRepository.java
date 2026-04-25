package com.lsam.PocketSecretary.domain.port.conversationaction;

import com.lsam.PocketSecretary.domain.model.conversationaction.ConversationActionItem;

public interface ConversationActionRepository {
    ConversationActionItem createConversationAction(ConversationActionItem item);
}
