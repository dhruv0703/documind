package com.dhruv.documind.dto.chat;

import java.util.UUID;

public record DocumentChunkSearchResult(
        UUID id,
        UUID documentId,
        int chunkIndex,
        String content,
        double similarity
) {
}
