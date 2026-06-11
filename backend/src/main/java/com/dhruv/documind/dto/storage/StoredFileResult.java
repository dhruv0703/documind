package com.dhruv.documind.dto.storage;

public record StoredFileResult(
        String storageKey,
        String contentType,
        long sizeBytes
) {
}
