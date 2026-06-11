package com.dhruv.documind.dto.chat;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChatAskRequest(
        @NotNull UUID documentId,
        @NotBlank @Size(max = 1000) String question
) {
}
