package com.dhruv.documind.dto.document;

import java.util.List;

public record DocumentListResponse(
        List<DocumentResponse> documents
) {
}
