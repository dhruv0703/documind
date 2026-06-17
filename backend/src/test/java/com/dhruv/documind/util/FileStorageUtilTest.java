package com.dhruv.documind.util;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import com.dhruv.documind.config.AppProperties;
import com.dhruv.documind.exception.BadRequestException;

class FileStorageUtilTest {

    private FileStorageUtil fileStorageUtil;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties();
        appProperties.getUpload().setMaxFileSizeBytes(1024);
        fileStorageUtil = new FileStorageUtil(appProperties);
    }

    @Test
    void validatePdfShouldRejectUnsupportedContentType() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.txt",
                "text/plain",
                "plain text".getBytes()
        );

        BadRequestException exception = assertThrows(BadRequestException.class, () -> fileStorageUtil.validatePdf(file));
        assertEquals("Only PDF uploads are supported", exception.getMessage());
    }

    @Test
    void validatePdfShouldRejectOversizedFile() {
        byte[] bytes = new byte[2048];
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.pdf",
                "application/pdf",
                bytes
        );

        BadRequestException exception = assertThrows(BadRequestException.class, () -> fileStorageUtil.validatePdf(file));
        assertEquals("PDF uploads are limited to 1 KB", exception.getMessage());
    }

    @Test
    void validatePdfShouldAllowPdfByFileExtensionWhenMimeTypeMissing() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.pdf",
                null,
                "pdf bytes".getBytes()
        );

        assertDoesNotThrow(() -> fileStorageUtil.validatePdf(file));
    }
}
