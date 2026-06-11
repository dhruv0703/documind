package com.dhruv.documind.service.impl;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dhruv.documind.config.AppProperties;
import com.dhruv.documind.dto.chat.ChatAskRequest;
import com.dhruv.documind.dto.chat.ChatAskResponse;
import com.dhruv.documind.dto.chat.ChatAskSourceResponse;
import com.dhruv.documind.dto.chat.ChatSearchRequest;
import com.dhruv.documind.dto.chat.ChatSearchResponse;
import com.dhruv.documind.dto.chat.ChatSearchResultResponse;
import com.dhruv.documind.dto.chat.DocumentChunkSearchResult;
import com.dhruv.documind.entity.Document;
import com.dhruv.documind.entity.DocumentStatus;
import com.dhruv.documind.exception.BadRequestException;
import com.dhruv.documind.exception.ResourceNotFoundException;
import com.dhruv.documind.repository.DocumentRepository;
import com.dhruv.documind.security.AuthenticatedUser;
import com.dhruv.documind.service.ChatService;
import com.dhruv.documind.service.VectorSearchService;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;

@Service
public class ChatServiceImpl implements ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatServiceImpl.class);
    private static final String RAG_SYSTEM_PROMPT = """
            You are a document Q&A assistant. Answer only from the provided context.
            If the answer is not in context, say you do not know based on the document.
            """;
    private static final String NO_CONTEXT_ANSWER =
            "I do not know based on the document because no relevant passages were found.";

    private final DocumentRepository documentRepository;
    private final VectorSearchService vectorSearchService;
    private final AppProperties appProperties;
    private final ChatClient chatClient;

    public ChatServiceImpl(
            DocumentRepository documentRepository,
            VectorSearchService vectorSearchService,
            AppProperties appProperties,
            ObjectProvider<ChatModel> chatModelProvider
    ) {
        this.documentRepository = documentRepository;
        this.vectorSearchService = vectorSearchService;
        this.appProperties = appProperties;
        ChatModel chatModel = resolveChatModel(chatModelProvider);
        this.chatClient = chatModel != null ? ChatClient.create(chatModel) : null;
    }

    @Override
    @Transactional(readOnly = true)
    public ChatAskResponse ask(ChatAskRequest request, AuthenticatedUser authenticatedUser) {
        long startedAt = System.nanoTime();
        UUID userId = authenticatedUser.getId();
        UUID documentId = request.documentId();

        List<DocumentChunkSearchResult> relevantChunks = retrieveRelevantChunks(
                userId,
                documentId,
                request.question(),
                5
        );
        List<ChatAskSourceResponse> sources = relevantChunks.stream()
                .map(this::toAskSource)
                .toList();

        String answer;
        if (relevantChunks.isEmpty()) {
            answer = NO_CONTEXT_ANSWER;
        } else if (!appProperties.getAi().getChat().isEnabled()) {
            log.warn("RAG chat disabled, returning mock answer userId={} documentId={} chunksRetrieved={}",
                    userId, documentId, relevantChunks.size());
            answer = buildMockAnswer(relevantChunks);
        } else if (chatClient == null) {
            log.warn("Chat model unavailable, returning mock answer userId={} documentId={} chunksRetrieved={}",
                    userId, documentId, relevantChunks.size());
            answer = buildMockAnswer(relevantChunks);
        } else {
            answer = generateAnswer(request.question(), relevantChunks);
        }

        long responseTimeMs = (System.nanoTime() - startedAt) / 1_000_000;
        log.info("RAG ask completed userId={} documentId={} chunksRetrieved={} responseTimeMs={}",
                userId, documentId, relevantChunks.size(), responseTimeMs);

        return new ChatAskResponse(answer, sources);
    }

    @Override
    @Transactional(readOnly = true)
    public ChatSearchResponse search(ChatSearchRequest request, AuthenticatedUser authenticatedUser) {
        List<ChatSearchResultResponse> results = retrieveRelevantChunks(
                authenticatedUser.getId(),
                request.documentId(),
                request.question(),
                request.limit()
        ).stream()
                .sorted(Comparator.comparingDouble(DocumentChunkSearchResult::similarity).reversed())
                .map(chunk -> new ChatSearchResultResponse(
                        chunk.chunkIndex(),
                        chunk.similarity(),
                        chunk.content()
                ))
                .toList();

        return new ChatSearchResponse(results);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentChunkSearchResult> retrieveRelevantChunks(UUID userId, UUID documentId, String question, int limit) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        if (document.getStatus() != DocumentStatus.READY) {
            throw new BadRequestException("Document is not ready for semantic search yet");
        }

        return vectorSearchService.searchRelevantChunks(document.getId(), question, limit);
    }

    private ChatAskSourceResponse toAskSource(DocumentChunkSearchResult chunk) {
        return new ChatAskSourceResponse(
                chunk.chunkIndex(),
                chunk.similarity(),
                toSnippet(chunk.content())
        );
    }

    private String generateAnswer(String question, List<DocumentChunkSearchResult> relevantChunks) {
        String userPrompt = """
                Question:
                %s

                Retrieved context:
                %s
                """.formatted(question, buildContextBlock(relevantChunks));

        return chatClient.prompt()
                .system(RAG_SYSTEM_PROMPT)
                .user(userPrompt)
                .call()
                .content();
    }

    private String buildMockAnswer(List<DocumentChunkSearchResult> relevantChunks) {
        String supportingPoints = relevantChunks.stream()
                .limit(3)
                .map(chunk -> "Chunk " + chunk.chunkIndex() + ": " + toSnippet(chunk.content()))
                .reduce((left, right) -> left + System.lineSeparator() + right)
                .orElse("No retrieved chunks available.");

        return """
                Chat generation is disabled, so this is a mock answer based on the retrieved chunks.
                Relevant passages:
                %s
                """.formatted(supportingPoints);
    }

    private String buildContextBlock(List<DocumentChunkSearchResult> relevantChunks) {
        StringBuilder builder = new StringBuilder();
        for (DocumentChunkSearchResult chunk : relevantChunks) {
            builder.append("[Chunk ")
                    .append(chunk.chunkIndex())
                    .append(" | similarity=")
                    .append(String.format("%.4f", chunk.similarity()))
                    .append("]")
                    .append(System.lineSeparator())
                    .append(chunk.content())
                    .append(System.lineSeparator())
                    .append(System.lineSeparator());
        }
        return builder.toString().trim();
    }

    private String toSnippet(String content) {
        return content.substring(0, Math.min(220, content.length()));
    }

    private ChatModel resolveChatModel(ObjectProvider<ChatModel> chatModelProvider) {
        try {
            return chatModelProvider.getIfAvailable();
        } catch (BeansException ex) {
            if (!appProperties.getAi().getChat().isEnabled()) {
                log.warn("Chat model unavailable while chat is disabled; continuing with mock chat responses");
                return null;
            }
            throw ex;
        }
    }
}
