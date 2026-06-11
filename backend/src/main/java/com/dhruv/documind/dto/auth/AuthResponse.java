package com.dhruv.documind.dto.auth;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
