package com.dhruv.documind.service.impl;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.dhruv.documind.config.AppProperties;

class TextChunkingServiceImplTest {

    private TextChunkingServiceImpl textChunkingService;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties();
        appProperties.getRag().setChunkSize(120);
        appProperties.getRag().setChunkOverlap(25);
        textChunkingService = new TextChunkingServiceImpl(appProperties);
    }

    @Test
    void chunkTextShouldSplitLongTextIntoMultipleChunks() {
        String text = """
                DocuMind indexes PDF paragraphs into searchable chunks. The first section explains upload flow and document preparation.

                The second section explains how embeddings are generated and stored for semantic retrieval in PostgreSQL with pgvector.

                The third section explains how the application answers questions from retrieved context and returns source citations.
                """;

        List<String> chunks = textChunkingService.chunkText(text);

        assertThat(chunks).hasSizeGreaterThan(1);
        assertThat(chunks.getFirst()).contains("DocuMind indexes PDF paragraphs");
    }

    @Test
    void chunkTextShouldPreserveOverlapBetweenSequentialChunks() {
        String text = """
                Paragraph one describes the upload operation and file storage lifecycle in precise terms for the chunking test.

                Paragraph two continues the same topic and is long enough to force a second chunk while preserving overlap text.
                """;

        List<String> chunks = textChunkingService.chunkText(text);

        assertThat(chunks).hasSize(2);
        String firstChunk = chunks.get(0);
        String secondChunk = chunks.get(1);
        String expectedOverlap = firstChunk.substring(firstChunk.length() - 20);

        assertThat(secondChunk).contains(expectedOverlap.trim());
    }

    @Test
    void chunkTextShouldHandleEmptyText() {
        assertThat(textChunkingService.chunkText("  ")).isEmpty();
        assertThat(textChunkingService.chunkText(null)).isEmpty();
    }
}
