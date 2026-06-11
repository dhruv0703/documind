package com.dhruv.documind.service.impl;

import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dhruv.documind.dto.auth.AuthResponse;
import com.dhruv.documind.dto.auth.LoginRequest;
import com.dhruv.documind.dto.auth.RegisterRequest;
import com.dhruv.documind.dto.auth.UserResponse;
import com.dhruv.documind.entity.User;
import com.dhruv.documind.exception.ConflictException;
import com.dhruv.documind.repository.UserRepository;
import com.dhruv.documind.security.AuthenticatedUser;
import com.dhruv.documind.service.AuthenticationService;
import com.dhruv.documind.service.JwtService;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthenticationServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .name(request.name().trim())
                .email(request.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        User savedUser = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(savedUser), toUserResponse(savedUser));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );

        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalStateException("Authenticated user missing from persistence"));

        return new AuthResponse(jwtService.generateToken(user), toUserResponse(user));
    }

    @Override
    public UserResponse getCurrentUser(AuthenticatedUser authenticatedUser) {
        return new UserResponse(
                authenticatedUser.getId(),
                authenticatedUser.getName(),
                authenticatedUser.getEmail()
        );
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
