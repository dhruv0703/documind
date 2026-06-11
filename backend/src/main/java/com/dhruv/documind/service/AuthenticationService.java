package com.dhruv.documind.service;

import com.dhruv.documind.dto.auth.AuthResponse;
import com.dhruv.documind.dto.auth.LoginRequest;
import com.dhruv.documind.dto.auth.RegisterRequest;
import com.dhruv.documind.dto.auth.UserResponse;
import com.dhruv.documind.security.AuthenticatedUser;

public interface AuthenticationService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(AuthenticatedUser authenticatedUser);
}
