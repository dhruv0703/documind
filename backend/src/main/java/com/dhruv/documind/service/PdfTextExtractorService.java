package com.dhruv.documind.service;

import org.springframework.web.multipart.MultipartFile;

public interface PdfTextExtractorService {

    String extractText(MultipartFile file);
}
