package com.dhruv.documind.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.dhruv.documind.dto.auth.AuthResponse;
import com.dhruv.documind.dto.auth.LoginRequest;
import com.dhruv.documind.dto.auth.RegisterRequest;
import com.dhruv.documind.entity.User;
import com.dhruv.documind.exception.ConflictException;
import com.dhruv.documind.repository.UserRepository;
import com.dhruv.documind.service.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private User savedUser;

    @BeforeEach
    void setUp() {
        savedUser = User.builder()
                .id(UUID.randomUUID())
                .name("Dhruv Shah")
                .email("test@example.com")
                .passwordHash("hashed-password")
                .createdAt(Instant.parse("2026-06-04T07:00:00Z"))
                .build();
    }

    @Test
    void registerShouldHashPasswordPersistUserAndReturnToken() {
        RegisterRequest request = new RegisterRequest("Dhruv Shah", "test@example.com", "password123");

        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(savedUser)).thenReturn("jwt-token");

        AuthResponse response = authenticationService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User persistedUser = userCaptor.getValue();

        assertThat(persistedUser.getName()).isEqualTo("Dhruv Shah");
        assertThat(persistedUser.getEmail()).isEqualTo("test@example.com");
        assertThat(persistedUser.getPasswordHash()).isEqualTo("hashed-password");
        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().id()).isEqualTo(savedUser.getId());
        assertThat(response.user().name()).isEqualTo("Dhruv Shah");
        assertThat(response.user().email()).isEqualTo("test@example.com");
    }

    @Test
    void registerShouldRejectDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Dhruv Shah", "test@example.com", "password123");
        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authenticationService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessage("An account with this email already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginShouldAuthenticateAndReturnJwtResponse() {
        LoginRequest request = new LoginRequest("test@example.com", "password123");

        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(savedUser));
        when(jwtService.generateToken(savedUser)).thenReturn("jwt-token");

        AuthResponse response = authenticationService.login(request);

        verify(authenticationManager).authenticate(
                new UsernamePasswordAuthenticationToken("test@example.com", "password123")
        );
        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo("test@example.com");
    }

    @Test
    void loginShouldPropagateAuthenticationFailure() {
        LoginRequest request = new LoginRequest("test@example.com", "wrong-password");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        assertThatThrownBy(() -> authenticationService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid credentials");

        verifyNoInteractions(jwtService);
    }
}
