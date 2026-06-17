package com.dhruv.documind.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.dhruv.documind.config.AppProperties;
import com.dhruv.documind.exception.BadRequestException;

@Component
public class FileStorageUtil {

    private final AppProperties appProperties;

    public FileStorageUtil(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("A PDF file is required");
        }

        long maxFileSizeBytes = appProperties.getUpload().getMaxFileSizeBytes();
        if (file.getSize() > maxFileSizeBytes) {
            throw new BadRequestException("PDF uploads are limited to " + humanReadableSize(maxFileSizeBytes));
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        Set<String> allowedContentTypes = appProperties.getUpload().getAllowedContentTypes().stream()
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
        Set<String> allowedExtensions = appProperties.getUpload().getAllowedExtensions().stream()
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());

        boolean contentTypeAllowed = contentType != null && allowedContentTypes.contains(contentType.toLowerCase(Locale.ROOT));
        boolean extensionAllowed = allowedExtensions.stream().anyMatch(originalFilename::endsWith);

        if (!contentTypeAllowed && !extensionAllowed) {
            throw new BadRequestException("Only PDF uploads are supported");
        }
    }

    public String safePdfFileName(String originalFilename) {
        String normalized = Normalizer.normalize(
                originalFilename == null || originalFilename.isBlank() ? "document.pdf" : originalFilename,
                Normalizer.Form.NFKC
        );
        String safe = normalized.replaceAll("[^A-Za-z0-9._-]", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("(^[.-]+)|([.-]+$)", "");

        if (safe.isBlank()) {
            safe = "document";
        }
        if (!safe.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            safe = safe + ".pdf";
        }
        return safe;
    }

    private String humanReadableSize(long bytes) {
        double value = bytes;
        String[] units = {"B", "KB", "MB", "GB"};
        int unitIndex = 0;

        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }

        boolean wholeNumber = Math.abs(value - Math.rint(value)) < 0.0001d;
        return String.format(
                Locale.ROOT,
                value >= 10 || unitIndex == 0 || wholeNumber ? "%.0f %s" : "%.1f %s",
                value,
                units[unitIndex]
        );
    }
}
