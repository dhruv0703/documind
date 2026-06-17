package com.dhruv.documind.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.dhruv.documind.dto.auth.AuthResponse;
import com.dhruv.documind.dto.auth.UserResponse;
import com.dhruv.documind.service.AuthenticationService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "app.rate-limit.auth-requests-per-minute=1")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AuthRateLimitTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthenticationService authenticationService;

    @Test
    void loginShouldReturnTooManyRequestsWhenLimitExceeded() throws Exception {
        when(authenticationService.login(any())).thenReturn(
                new AuthResponse("jwt-token", new UserResponse(UUID.randomUUID(), "Dhruv Shah", "test@example.com"))
        );

        String requestBody = """
                {
                  "email": "test@example.com",
                  "password": "password123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.message").value("Too many requests. Please wait a minute and try again."));
    }
}
