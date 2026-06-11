package com.dhruv.documind.service;

import java.util.List;
import java.util.UUID;

import com.dhruv.documind.dto.chat.ChatAskRequest;
import com.dhruv.documind.dto.chat.ChatAskResponse;
import com.dhruv.documind.dto.chat.ChatSearchRequest;
import com.dhruv.documind.dto.chat.ChatSearchResponse;
import com.dhruv.documind.dto.chat.DocumentChunkSearchResult;
import com.dhruv.documind.security.AuthenticatedUser;

public interface ChatService {

    ChatAskResponse ask(ChatAskRequest request, AuthenticatedUser authenticatedUser);

    ChatSearchResponse search(ChatSearchRequest request, AuthenticatedUser authenticatedUser);

    List<DocumentChunkSearchResult> retrieveRelevantChunks(UUID userId, UUID documentId, String question, int limit);
}
