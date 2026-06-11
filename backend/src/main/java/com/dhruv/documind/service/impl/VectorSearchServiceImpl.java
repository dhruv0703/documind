package com.dhruv.documind.service.impl;

import java.util.Comparator;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.dhruv.documind.config.AppProperties;
import com.dhruv.documind.dto.chat.DocumentChunkSearchResult;
import com.dhruv.documind.entity.DocumentChunk;
import com.dhruv.documind.repository.DocumentChunkRepository;
import com.dhruv.documind.repository.DocumentChunkSearchRepository;
import com.dhruv.documind.service.EmbeddingService;
import com.dhruv.documind.service.VectorSearchService;
import com.dhruv.documind.util.PgVectorSqlUtil;

@Service
public class VectorSearchServiceImpl implements VectorSearchService {

    private static final Logger log = LoggerFactory.getLogger(VectorSearchServiceImpl.class);

    private final AppProperties appProperties;
    private final DocumentChunkRepository documentChunkRepository;
    private final DocumentChunkSearchRepository documentChunkSearchRepository;
    private final EmbeddingService embeddingService;
    private final PgVectorSqlUtil pgVectorSqlUtil;

    public VectorSearchServiceImpl(
            AppProperties appProperties,
            DocumentChunkRepository documentChunkRepository,
            DocumentChunkSearchRepository documentChunkSearchRepository,
            EmbeddingService embeddingService,
            PgVectorSqlUtil pgVectorSqlUtil
    ) {
        this.appProperties = appProperties;
        this.documentChunkRepository = documentChunkRepository;
        this.documentChunkSearchRepository = documentChunkSearchRepository;
        this.embeddingService = embeddingService;
        this.pgVectorSqlUtil = pgVectorSqlUtil;
    }

    @Override
    public List<DocumentChunkSearchResult> searchRelevantChunks(UUID documentId, String question, int limit) {
        if (!appProperties.getAi().getEmbeddings().isEnabled()) {
            log.warn("Embeddings disabled, using keyword fallback retrieval documentId={} limit={}", documentId, limit);
            return searchWithoutEmbeddings(documentId, question, limit);
        }

        List<Double> queryEmbedding = embeddingService.embed(question);
        return documentChunkSearchRepository.searchSimilarChunks(
                documentId,
                pgVectorSqlUtil.toSqlVector(queryEmbedding),
                limit
        );
    }

    private List<DocumentChunkSearchResult> searchWithoutEmbeddings(UUID documentId, String question, int limit) {
        Set<String> keywords = tokenize(question);
        return documentChunkRepository.findByDocumentIdOrderByChunkIndexAsc(documentId).stream()
                .map(chunk -> toSearchResult(chunk, keywordSimilarity(chunk.getContent(), keywords)))
                .sorted(Comparator.comparingDouble(DocumentChunkSearchResult::similarity).reversed()
                        .thenComparingInt(DocumentChunkSearchResult::chunkIndex))
                .limit(limit)
                .toList();
    }

    private DocumentChunkSearchResult toSearchResult(DocumentChunk chunk, double similarity) {
        return new DocumentChunkSearchResult(
                chunk.getId(),
                chunk.getDocument().getId(),
                chunk.getChunkIndex(),
                chunk.getContent(),
                similarity
        );
    }

    private double keywordSimilarity(String content, Set<String> keywords) {
        if (keywords.isEmpty()) {
            return 0.5d;
        }

        String normalizedContent = content.toLowerCase(Locale.ROOT);
        long matchedKeywords = keywords.stream()
                .filter(normalizedContent::contains)
                .count();

        if (matchedKeywords == 0) {
            return 0.05d;
        }

        return matchedKeywords / (double) keywords.size();
    }

    private Set<String> tokenize(String question) {
        return Arrays.stream(question.toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
                .map(String::trim)
                .filter(token -> token.length() >= 3)
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }
}
