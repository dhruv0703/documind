package com.dhruv.documind.util;

import java.text.Normalizer;
import java.util.Locale;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.dhruv.documind.exception.BadRequestException;

@Component
public class FileStorageUtil {

    public void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("A PDF file is required");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (!"application/pdf".equalsIgnoreCase(contentType) && !originalFilename.endsWith(".pdf")) {
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
}
