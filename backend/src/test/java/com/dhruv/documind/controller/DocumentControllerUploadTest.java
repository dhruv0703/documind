package com.dhruv.documind.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockMultipartFile;

import com.dhruv.documind.dto.document.DocumentUploadResponse;
import com.dhruv.documind.entity.DocumentStatus;
import com.dhruv.documind.entity.User;
import com.dhruv.documind.security.AuthenticatedUser;
import com.dhruv.documind.service.DocumentService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DocumentControllerUploadTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DocumentService documentService;

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
    void uploadShouldReturnCreatedResponseForAuthenticatedUser() throws Exception {
        UUID documentId = UUID.randomUUID();
        when(documentService.upload(any(), any())).thenReturn(
                new DocumentUploadResponse(documentId, "sample.pdf", DocumentStatus.READY, 4)
        );

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.pdf",
                "application/pdf",
                "sample pdf bytes".getBytes()
        );

        mockMvc.perform(multipart("/api/documents/upload")
                        .file(file)
                        .with(authentication(authentication)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.documentId").value(documentId.toString()))
                .andExpect(jsonPath("$.fileName").value("sample.pdf"))
                .andExpect(jsonPath("$.status").value("READY"))
                .andExpect(jsonPath("$.chunkCount").value(4));
    }
}
