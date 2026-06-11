package com.dhruv.documind.service;

import java.util.UUID;

import com.dhruv.documind.dto.document.DocumentListResponse;
import com.dhruv.documind.dto.document.DocumentResponse;
import com.dhruv.documind.dto.document.DocumentUploadRequest;
import com.dhruv.documind.dto.document.DocumentUploadResponse;
import com.dhruv.documind.security.AuthenticatedUser;

public interface DocumentService {

    DocumentUploadResponse upload(DocumentUploadRequest request, AuthenticatedUser authenticatedUser);

    DocumentListResponse listDocuments(AuthenticatedUser authenticatedUser);

    DocumentResponse getDocument(UUID documentId, AuthenticatedUser authenticatedUser);

    void deleteDocument(UUID documentId, AuthenticatedUser authenticatedUser);
}
