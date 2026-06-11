package com.dhruv.documind.dto.auth;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email
) {
}
