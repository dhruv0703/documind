package com.dhruv.documind.dto.document;

import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record DocumentUploadRequest(
        @Schema(type = "string", format = "binary", description = "PDF file to upload")
        @NotNull MultipartFile file
) {
}
