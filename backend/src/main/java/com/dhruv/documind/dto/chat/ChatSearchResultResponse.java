package com.dhruv.documind.dto.chat;

public record ChatSearchResultResponse(
        int chunkIndex,
        double similarity,
        String content
) {
}
