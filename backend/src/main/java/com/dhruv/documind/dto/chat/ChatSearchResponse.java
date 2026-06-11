package com.dhruv.documind.dto.chat;

import java.util.List;

public record ChatSearchResponse(
        List<ChatSearchResultResponse> results
) {
}
