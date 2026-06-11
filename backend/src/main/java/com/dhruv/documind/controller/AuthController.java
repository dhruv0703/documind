package com.dhruv.documind.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.dhruv.documind.dto.auth.AuthResponse;
import com.dhruv.documind.dto.auth.LoginRequest;
import com.dhruv.documind.dto.auth.RegisterRequest;
import com.dhruv.documind.dto.auth.UserResponse;
import com.dhruv.documind.security.AuthenticatedUser;
import com.dhruv.documind.security.CurrentUser;
import com.dhruv.documind.service.AuthenticationService;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authenticationService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authenticationService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(@Parameter(hidden = true) @CurrentUser AuthenticatedUser authenticatedUser) {
        return authenticationService.getCurrentUser(authenticatedUser);
    }
}
