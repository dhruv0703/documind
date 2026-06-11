package com.dhruv.documind.service.impl;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dhruv.documind.dto.document.DocumentListResponse;
import com.dhruv.documind.dto.document.DocumentResponse;
import com.dhruv.documind.dto.document.DocumentUploadRequest;
import com.dhruv.documind.dto.document.DocumentUploadResponse;
import com.dhruv.documind.dto.storage.StoredFileResult;
import com.dhruv.documind.entity.Document;
import com.dhruv.documind.entity.DocumentStatus;
import com.dhruv.documind.entity.User;
import com.dhruv.documind.exception.BadRequestException;
import com.dhruv.documind.exception.DocumentProcessingException;
import com.dhruv.documind.exception.ResourceNotFoundException;
import com.dhruv.documind.repository.DocumentRepository;
import com.dhruv.documind.repository.UserRepository;
import com.dhruv.documind.security.AuthenticatedUser;
import com.dhruv.documind.service.DocumentIngestionService;
import com.dhruv.documind.service.DocumentService;
import com.dhruv.documind.service.StorageService;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final StorageService storageService;
    private final DocumentIngestionService documentIngestionService;

    public DocumentServiceImpl(
            UserRepository userRepository,
            DocumentRepository documentRepository,
            StorageService storageService,
            DocumentIngestionService documentIngestionService
    ) {
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.storageService = storageService;
        this.documentIngestionService = documentIngestionService;
    }

    @Override
    @Transactional
    public DocumentUploadResponse upload(DocumentUploadRequest request, AuthenticatedUser authenticatedUser) {
        validateUpload(request);

        User user = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UUID documentId = UUID.randomUUID();
        StoredFileResult storedFile = storageService.uploadPdf(request.file(), authenticatedUser.getId(), documentId);
        String originalFileName = request.file().getOriginalFilename() == null
                ? documentId + ".pdf"
                : request.file().getOriginalFilename();

        Document document = Document.builder()
                .id(documentId)
                .user(user)
                .originalFileName(originalFileName)
                .s3Key(storedFile.storageKey())
                .contentType(storedFile.contentType())
                .sizeBytes(storedFile.sizeBytes())
                .status(DocumentStatus.UPLOADED)
                .build();

        Document savedDocument = documentRepository.save(document);
        try {
            Document ingestedDocument = documentIngestionService.ingest(savedDocument, request.file());
            return new DocumentUploadResponse(
                    ingestedDocument.getId(),
                    ingestedDocument.getOriginalFileName(),
                    ingestedDocument.getStatus(),
                    ingestedDocument.getChunks() == null ? 0 : ingestedDocument.getChunks().size()
            );
        } catch (DocumentProcessingException ex) {
            Document failedDocument = documentRepository.findById(savedDocument.getId()).orElse(savedDocument);
            return new DocumentUploadResponse(
                    failedDocument.getId(),
                    failedDocument.getOriginalFileName(),
                    failedDocument.getStatus(),
                    failedDocument.getChunks() == null ? 0 : failedDocument.getChunks().size()
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentListResponse listDocuments(AuthenticatedUser authenticatedUser) {
        return new DocumentListResponse(
                documentRepository.findAllByUserIdOrderByCreatedAtDesc(authenticatedUser.getId()).stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDocument(UUID documentId, AuthenticatedUser authenticatedUser) {
        return toResponse(findOwnedDocument(documentId, authenticatedUser.getId()));
    }

    @Override
    @Transactional
    public void deleteDocument(UUID documentId, AuthenticatedUser authenticatedUser) {
        Document document = findOwnedDocument(documentId, authenticatedUser.getId());
        storageService.deleteFile(document.getS3Key());
        documentRepository.delete(document);
    }

    private Document findOwnedDocument(UUID documentId, UUID userId) {
        return documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }

    private void validateUpload(DocumentUploadRequest request) {
        if (request.file() == null || request.file().isEmpty()) {
            throw new BadRequestException("A PDF file is required");
        }
    }

    private DocumentResponse toResponse(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getOriginalFileName(),
                document.getS3Key(),
                document.getContentType(),
                document.getSizeBytes(),
                document.getStatus(),
                document.getChunks() == null ? 0 : document.getChunks().size(),
                document.getCreatedAt()
        );
    }
}
