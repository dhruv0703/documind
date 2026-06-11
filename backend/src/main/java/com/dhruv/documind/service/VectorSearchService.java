package com.dhruv.documind.service;

import java.util.List;
import java.util.UUID;

import com.dhruv.documind.dto.chat.DocumentChunkSearchResult;

public interface VectorSearchService {

    List<DocumentChunkSearchResult> searchRelevantChunks(UUID documentId, String question, int limit);
}
