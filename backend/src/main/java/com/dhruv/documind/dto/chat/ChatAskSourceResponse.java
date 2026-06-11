package com.dhruv.documind.dto.chat;

public record ChatAskSourceResponse(
        int chunkIndex,
        double similarity,
        String snippet
) {
}
