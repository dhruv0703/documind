package com.dhruv.documind.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dhruv.documind.dto.chat.ChatAskRequest;
import com.dhruv.documind.dto.chat.ChatAskResponse;
import com.dhruv.documind.dto.chat.ChatSearchRequest;
import com.dhruv.documind.dto.chat.ChatSearchResponse;
import com.dhruv.documind.security.AuthenticatedUser;
import com.dhruv.documind.security.CurrentUser;
import com.dhruv.documind.service.ChatService;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/ask")
    public ChatAskResponse ask(
            @Valid @RequestBody ChatAskRequest request,
            @Parameter(hidden = true) @CurrentUser AuthenticatedUser authenticatedUser
    ) {
        return chatService.ask(request, authenticatedUser);
    }

    @PostMapping("/search")
    public ChatSearchResponse search(
            @Valid @RequestBody ChatSearchRequest request,
            @Parameter(hidden = true) @CurrentUser AuthenticatedUser authenticatedUser
    ) {
        return chatService.search(request, authenticatedUser);
    }
}
