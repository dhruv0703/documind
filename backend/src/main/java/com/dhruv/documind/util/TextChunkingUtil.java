package com.dhruv.documind.util;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.dhruv.documind.config.AppProperties;

@Component
public class TextChunkingUtil {

    private final AppProperties appProperties;

    public TextChunkingUtil(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public List<String> chunk(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return chunks;
        }

        int chunkSize = appProperties.getRag().getChunkSize();
        int overlap = appProperties.getRag().getChunkOverlap();
        int start = 0;
        while (start < text.length()) {
            int end = Math.min(text.length(), start + chunkSize);
            chunks.add(text.substring(start, end).trim());
            if (end == text.length()) {
                break;
            }
            start = Math.max(end - overlap, start + 1);
        }
        return chunks;
    }
}
