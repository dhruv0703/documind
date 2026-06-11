package com.dhruv.documind.service.impl;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dhruv.documind.config.AppProperties;
import com.dhruv.documind.dto.storage.StoredFileResult;
import com.dhruv.documind.exception.StorageException;
import com.dhruv.documind.service.StorageService;
import com.dhruv.documind.util.FileStorageUtil;

@Service
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private final AppProperties appProperties;
    private final FileStorageUtil fileStorageUtil;

    public LocalStorageService(AppProperties appProperties, FileStorageUtil fileStorageUtil) {
        this.appProperties = appProperties;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Override
    public StoredFileResult uploadPdf(MultipartFile file, UUID userId, UUID documentId) {
        fileStorageUtil.validatePdf(file);

        String safeFileName = fileStorageUtil.safePdfFileName(file.getOriginalFilename());
        Path root = Paths.get(appProperties.getStorage().getLocalUploadDir()).toAbsolutePath().normalize();
        Path relativePath = Paths.get("users", userId.toString(), "documents", documentId.toString(), safeFileName);
        Path targetPath = root.resolve(relativePath).normalize();

        try {
            Files.createDirectories(targetPath.getParent());
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new StorageException("Failed to store uploaded PDF locally");
        }

        return new StoredFileResult(relativePath.toString().replace('\\', '/'), "application/pdf", file.getSize());
    }

    @Override
    public void deleteFile(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }

        Path root = Paths.get(appProperties.getStorage().getLocalUploadDir()).toAbsolutePath().normalize();
        Path targetPath = root.resolve(storageKey).normalize();

        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException ex) {
            throw new StorageException("Failed to delete stored PDF");
        }
    }

    @Override
    public Optional<String> getPresignedDownloadUrl(String s3Key) {
        return Optional.empty();
    }
}
