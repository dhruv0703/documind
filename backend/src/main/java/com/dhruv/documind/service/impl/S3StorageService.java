package com.dhruv.documind.service.impl;

import java.time.Duration;
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

import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.core.exception.SdkClientException;

@Service
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "s3")
public class S3StorageService implements StorageService {

    private final AppProperties appProperties;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final FileStorageUtil fileStorageUtil;

    public S3StorageService(
            AppProperties appProperties,
            S3Client s3Client,
            S3Presigner s3Presigner,
            FileStorageUtil fileStorageUtil
    ) {
        this.appProperties = appProperties;
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Override
    public StoredFileResult uploadPdf(MultipartFile file, UUID userId, UUID documentId) {
        fileStorageUtil.validatePdf(file);

        String bucket = requireBucket();
        String originalFilename = file.getOriginalFilename() == null ? "document.pdf" : file.getOriginalFilename();
        String safeFileName = fileStorageUtil.safePdfFileName(file.getOriginalFilename());
        String s3Key = "users/" + userId + "/documents/" + documentId + "/" + safeFileName;

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(s3Key)
                .contentType("application/pdf")
                .metadata(java.util.Map.of(
                        "original-filename", originalFilename,
                        "user-id", userId.toString()
                ))
                .build();

        try {
            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return new StoredFileResult(s3Key, "application/pdf", file.getSize());
        } catch (SdkClientException ex) {
            throw new StorageException("AWS credentials or client configuration are invalid for S3 upload");
        } catch (AwsServiceException ex) {
            throw new StorageException("S3 upload failed: " + ex.awsErrorDetails().errorMessage());
        } catch (Exception ex) {
            throw new StorageException("Failed to upload PDF to S3");
        }
    }

    @Override
    public void deleteFile(String s3Key) {
        if (s3Key == null || s3Key.isBlank()) {
            return;
        }

        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(requireBucket())
                    .key(s3Key)
                    .build());
        } catch (SdkClientException ex) {
            throw new StorageException("AWS credentials or client configuration are invalid for S3 delete");
        } catch (AwsServiceException ex) {
            throw new StorageException("S3 delete failed: " + ex.awsErrorDetails().errorMessage());
        }
    }

    @Override
    public Optional<String> getPresignedDownloadUrl(String s3Key) {
        if (s3Key == null || s3Key.isBlank()) {
            return Optional.empty();
        }

        try {
            GetObjectRequest objectRequest = GetObjectRequest.builder()
                    .bucket(requireBucket())
                    .key(s3Key)
                    .build();
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .getObjectRequest(objectRequest)
                    .build();
            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            return Optional.of(presignedRequest.url().toString());
        } catch (SdkClientException ex) {
            throw new StorageException("AWS credentials or client configuration are invalid for S3 presigning");
        } catch (AwsServiceException ex) {
            throw new StorageException("Failed to generate S3 presigned URL: " + ex.awsErrorDetails().errorMessage());
        }
    }

    private String requireBucket() {
        String bucket = appProperties.getAws().getS3().getBucket();
        if (bucket == null || bucket.isBlank()) {
            throw new StorageException("AWS S3 bucket is not configured");
        }
        return bucket;
    }
}
