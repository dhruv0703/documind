package com.dhruv.documind.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dhruv.documind.config.AppProperties;
import com.dhruv.documind.service.TextChunkingService;

@Service
public class TextChunkingServiceImpl implements TextChunkingService {

    private final AppProperties appProperties;

    public TextChunkingServiceImpl(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @Override
    public List<String> chunkText(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        int targetSize = appProperties.getRag().getChunkSize();
        int overlap = appProperties.getRag().getChunkOverlap();

        List<String> paragraphs = splitIntoParagraphs(text);
        List<String> baseChunks = buildBaseChunks(paragraphs, targetSize);
        return applyOverlap(baseChunks, overlap);
    }

    private List<String> splitIntoParagraphs(String text) {
        String normalized = text.replace("\r\n", "\n")
                .replace('\r', '\n')
                .replaceAll("[\\t\\x0B\\f ]+", " ")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();

        String[] rawParagraphs = normalized.split("\\n\\s*\\n");
        List<String> paragraphs = new ArrayList<>();
        for (String rawParagraph : rawParagraphs) {
            String cleaned = rawParagraph.replaceAll("\\s*\\n\\s*", " ").replaceAll("\\s{2,}", " ").trim();
            if (!cleaned.isBlank()) {
                paragraphs.add(cleaned);
            }
        }
        return paragraphs;
    }

    private List<String> buildBaseChunks(List<String> paragraphs, int targetSize) {
        List<String> chunks = new ArrayList<>();
        StringBuilder currentChunk = new StringBuilder();

        for (String paragraph : paragraphs) {
            if (paragraph.length() > targetSize) {
                if (!currentChunk.isEmpty()) {
                    chunks.add(currentChunk.toString().trim());
                    currentChunk.setLength(0);
                }
                chunks.addAll(splitLongParagraph(paragraph, targetSize));
                continue;
            }

            int separatorLength = currentChunk.isEmpty() ? 0 : 2;
            if (currentChunk.length() + separatorLength + paragraph.length() > targetSize && !currentChunk.isEmpty()) {
                chunks.add(currentChunk.toString().trim());
                currentChunk.setLength(0);
            }

            if (!currentChunk.isEmpty()) {
                currentChunk.append("\n\n");
            }
            currentChunk.append(paragraph);
        }

        if (!currentChunk.isEmpty()) {
            chunks.add(currentChunk.toString().trim());
        }

        return chunks;
    }

    private List<String> splitLongParagraph(String paragraph, int targetSize) {
        List<String> chunks = new ArrayList<>();
        int start = 0;
        while (start < paragraph.length()) {
            int end = Math.min(paragraph.length(), start + targetSize);
            if (end < paragraph.length()) {
                int sentenceBreak = Math.max(paragraph.lastIndexOf(". ", end), paragraph.lastIndexOf("? ", end));
                sentenceBreak = Math.max(sentenceBreak, paragraph.lastIndexOf("! ", end));
                int whitespaceBreak = paragraph.lastIndexOf(' ', end);
                int preferredBreak = Math.max(sentenceBreak, whitespaceBreak);
                if (preferredBreak > start + (targetSize / 2)) {
                    end = preferredBreak + 1;
                }
            }

            chunks.add(paragraph.substring(start, end).trim());
            start = end;
        }
        return chunks;
    }

    private List<String> applyOverlap(List<String> baseChunks, int overlap) {
        if (baseChunks.isEmpty() || overlap <= 0) {
            return baseChunks;
        }

        List<String> overlapped = new ArrayList<>(baseChunks.size());
        String previous = null;
        for (String chunk : baseChunks) {
            if (previous == null) {
                overlapped.add(chunk);
            } else {
                String prefix = suffix(previous, overlap);
                overlapped.add((prefix + "\n\n" + chunk).trim());
            }
            previous = chunk;
        }
        return overlapped;
    }

    private String suffix(String text, int maxLength) {
        if (text.length() <= maxLength) {
            return text;
        }
        int start = text.length() - maxLength;
        int nextWhitespace = text.indexOf(' ', start);
        if (nextWhitespace > start && nextWhitespace < text.length() - 1) {
            start = nextWhitespace + 1;
        }
        return text.substring(start).trim();
    }
}
