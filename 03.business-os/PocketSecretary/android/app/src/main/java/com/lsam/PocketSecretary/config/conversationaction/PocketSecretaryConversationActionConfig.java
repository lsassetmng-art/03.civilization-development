package com.lsam.PocketSecretary.config.conversationaction;

import com.lsam.PocketSecretary.api.controller.conversationaction.ConversationActionCreateController;
import com.lsam.PocketSecretary.application.mapper.conversationaction.ConversationActionCreateMapper;
import com.lsam.PocketSecretary.application.service.conversationaction.ConversationActionCreateService;
import com.lsam.PocketSecretary.application.validator.conversationaction.ConversationActionCreateValidator;
import com.lsam.PocketSecretary.infrastructure.audit.DatabasePocketSecretaryAuditAdapter;
import com.lsam.PocketSecretary.infrastructure.repository.conversationaction.JdbcConversationActionRepository;

public final class PocketSecretaryConversationActionConfig {

    public ConversationActionCreateController conversationActionCreateController() {
        return new ConversationActionCreateController(
                new ConversationActionCreateService(
                        new ConversationActionCreateValidator(),
                        new ConversationActionCreateMapper(),
                        new JdbcConversationActionRepository(),
                        new DatabasePocketSecretaryAuditAdapter()
                )
        );
    }
}
