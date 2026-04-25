package com.lsam.PocketSecretary.api.controller.conversationaction;

import com.lsam.PocketSecretary.api.dto.conversationaction.request.ConversationActionCreateRequest;
import com.lsam.PocketSecretary.api.dto.conversationaction.response.ConversationActionCreateResponse;
import com.lsam.PocketSecretary.application.service.conversationaction.ConversationActionCreateService;

public final class ConversationActionCreateController {

    private final ConversationActionCreateService service;

    public ConversationActionCreateController(final ConversationActionCreateService service) {
        this.service = service;
    }

    public ConversationActionCreateResponse create(final ConversationActionCreateRequest request) {
        return service.create(request);
    }
}
