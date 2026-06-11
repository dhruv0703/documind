package com.dhruv.documind.dto.chat;

import java.util.List;

public record ChatAskResponse(
        String answer,
        List<ChatAskSourceResponse> sources
) {
}
