package com.dhruv.documind.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.dhruv.documind.dto.document.DocumentListResponse;
import com.dhruv.documind.dto.document.DocumentResponse;
import com.dhruv.documind.dto.document.DocumentUploadRequest;
import com.dhruv.documind.dto.document.DocumentUploadResponse;
import com.dhruv.documind.security.AuthenticatedUser;
import com.dhruv.documind.security.CurrentUser;
import com.dhruv.documind.service.DocumentService;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentUploadResponse upload(
            @Valid @ModelAttribute DocumentUploadRequest request,
            @Parameter(hidden = true) @CurrentUser AuthenticatedUser authenticatedUser
    ) {
        return documentService.upload(request, authenticatedUser);
    }

    @GetMapping
    public DocumentListResponse list(@Parameter(hidden = true) @CurrentUser AuthenticatedUser authenticatedUser) {
        return documentService.listDocuments(authenticatedUser);
    }

    @GetMapping("/{id}")
    public DocumentResponse getById(
            @PathVariable UUID id,
            @Parameter(hidden = true) @CurrentUser AuthenticatedUser authenticatedUser
    ) {
        return documentService.getDocument(id, authenticatedUser);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID id,
            @Parameter(hidden = true) @CurrentUser AuthenticatedUser authenticatedUser
    ) {
        documentService.deleteDocument(id, authenticatedUser);
    }
}
