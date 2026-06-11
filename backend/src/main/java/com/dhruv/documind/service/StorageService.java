package com.dhruv.documind.service;

import java.util.UUID;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

import com.dhruv.documind.dto.storage.StoredFileResult;

public interface StorageService {

    StoredFileResult uploadPdf(MultipartFile file, UUID userId, UUID documentId);

    void deleteFile(String s3Key);

    Optional<String> getPresignedDownloadUrl(String s3Key);
}
