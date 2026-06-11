package com.dhruv.documind.dto.document;

import java.util.UUID;

import com.dhruv.documind.entity.DocumentStatus;

public record DocumentUploadResponse(
        UUID documentId,
        String fileName,
        DocumentStatus status,
        int chunkCount
) {
}
