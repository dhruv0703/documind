package com.dhruv.documind.dto.chat;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChatSearchRequest(
        @NotNull UUID documentId,
        @NotBlank @Size(min = 3, max = 4000) String question,
        @NotNull @Min(1) @Max(20) Integer limit
) {
}
