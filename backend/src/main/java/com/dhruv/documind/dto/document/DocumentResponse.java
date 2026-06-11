package com.dhruv.documind.dto.document;

import java.time.Instant;
import java.util.UUID;

import com.dhruv.documind.entity.DocumentStatus;

public record DocumentResponse(
        UUID documentId,
        String fileName,
        String storageKey,
        String contentType,
        long sizeBytes,
        DocumentStatus status,
        int chunkCount,
        Instant createdAt
) {
}
