package com.dhruv.documind.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.dhruv.documind.dto.chat.ChatAskResponse;
import com.dhruv.documind.dto.chat.ChatAskSourceResponse;
import com.dhruv.documind.entity.User;
import com.dhruv.documind.security.AuthenticatedUser;
import com.dhruv.documind.service.ChatService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ChatService chatService;

    private UsernamePasswordAuthenticationToken authentication;

    @BeforeEach
    void setUp() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .name("Dhruv Shah")
                .email("test@example.com")
                .passwordHash("hashed-password")
                .createdAt(Instant.parse("2026-06-04T00:00:00Z"))
                .build();
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(user);
        authentication = new UsernamePasswordAuthenticationToken(
                authenticatedUser,
                null,
                authenticatedUser.getAuthorities()
        );
    }

    @Test
    void askShouldReturnAnswerAndSourcesForAuthenticatedUser() throws Exception {
        when(chatService.ask(any(), any())).thenReturn(new ChatAskResponse(
                "The PDF focuses on uploads, chunking, and semantic retrieval.",
                List.of(new ChatAskSourceResponse(3, 0.84, "This section explains chunk retrieval."))
        ));

        mockMvc.perform(post("/api/chat/ask")
                        .with(authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "documentId": "11111111-1111-1111-1111-111111111111",
                                  "question": "What are the main points of this PDF?"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("The PDF focuses on uploads, chunking, and semantic retrieval."))
                .andExpect(jsonPath("$.sources[0].chunkIndex").value(3))
                .andExpect(jsonPath("$.sources[0].similarity").value(0.84))
                .andExpect(jsonPath("$.sources[0].snippet").value("This section explains chunk retrieval."));
    }
}
