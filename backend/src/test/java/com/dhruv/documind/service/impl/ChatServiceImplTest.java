package com.dhruv.documind.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;

import com.dhruv.documind.config.AppProperties;
import com.dhruv.documind.dto.chat.ChatAskRequest;
import com.dhruv.documind.dto.chat.ChatAskResponse;
import com.dhruv.documind.dto.chat.DocumentChunkSearchResult;
import com.dhruv.documind.entity.Document;
import com.dhruv.documind.entity.DocumentStatus;
import com.dhruv.documind.entity.User;
import com.dhruv.documind.repository.DocumentRepository;
import com.dhruv.documind.security.AuthenticatedUser;
import com.dhruv.documind.service.VectorSearchService;

@ExtendWith(MockitoExtension.class)
class ChatServiceImplTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private VectorSearchService vectorSearchService;

    @Mock
    private ObjectProvider<org.springframework.ai.chat.model.ChatModel> chatModelProvider;

    private ChatServiceImpl chatService;

    private AuthenticatedUser authenticatedUser;
    private Document document;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties();
        appProperties.getAi().getChat().setEnabled(false);
        chatService = new ChatServiceImpl(documentRepository, vectorSearchService, appProperties, chatModelProvider);

        User user = User.builder()
                .id(UUID.randomUUID())
                .name("Dhruv Shah")
                .email("test@example.com")
                .passwordHash("hashed-password")
                .createdAt(Instant.parse("2026-06-05T00:00:00Z"))
                .build();
        authenticatedUser = new AuthenticatedUser(user);

        document = Document.builder()
                .id(UUID.randomUUID())
                .user(user)
                .originalFileName("sample.pdf")
                .s3Key("users/test/documents/sample.pdf")
                .contentType("application/pdf")
                .sizeBytes(1024L)
                .status(DocumentStatus.READY)
                .createdAt(Instant.parse("2026-06-05T00:00:00Z"))
                .build();
    }

    @Test
    void askShouldReturnAnswerAndSourcesFromRetrievedChunks() {
        ChatAskRequest request = new ChatAskRequest(document.getId(), "What are the main points?");
        List<DocumentChunkSearchResult> chunks = List.of(
                new DocumentChunkSearchResult(
                        UUID.randomUUID(),
                        document.getId(),
                        3,
                        "This document explains how DocuMind uploads PDFs and stores chunks for semantic retrieval.",
                        0.84
                ),
                new DocumentChunkSearchResult(
                        UUID.randomUUID(),
                        document.getId(),
                        4,
                        "It also explains how answers are generated from retrieved context and returned with sources.",
                        0.79
                )
        );

        when(documentRepository.findByIdAndUserId(document.getId(), authenticatedUser.getId()))
                .thenReturn(Optional.of(document));
        when(vectorSearchService.searchRelevantChunks(document.getId(), request.question(), 5))
                .thenReturn(chunks);

        ChatAskResponse response = chatService.ask(request, authenticatedUser);

        assertThat(response.answer()).contains("mock answer");
        assertThat(response.sources()).hasSize(2);
        assertThat(response.sources().getFirst().chunkIndex()).isEqualTo(3);
        assertThat(response.sources().getFirst().similarity()).isEqualTo(0.84);
        assertThat(response.sources().getFirst().snippet()).contains("DocuMind uploads PDFs");
    }
}
