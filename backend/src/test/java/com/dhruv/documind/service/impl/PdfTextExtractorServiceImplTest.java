package com.dhruv.documind.service.impl;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class PdfTextExtractorServiceImplTest {

    private final PdfTextExtractorServiceImpl pdfTextExtractorService = new PdfTextExtractorServiceImpl();

    @Test
    void extractTextShouldReadSamplePdf() throws IOException {
        byte[] bytes = Files.readAllBytes(Path.of("src", "test", "resources", "sample.pdf"));
        MockMultipartFile file = new MockMultipartFile("file", "sample.pdf", "application/pdf", bytes);

        String extractedText = pdfTextExtractorService.extractText(file);

        assertThat(extractedText).contains("DocuMind sample PDF for extractor test.");
    }
}
