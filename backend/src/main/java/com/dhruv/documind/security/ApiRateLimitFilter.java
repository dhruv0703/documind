package com.dhruv.documind.security;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.dhruv.documind.config.AppProperties;
import com.dhruv.documind.dto.error.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ApiRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/auth/login";
    private static final String REGISTER_PATH = "/api/auth/register";
    private static final String UPLOAD_PATH = "/api/documents/upload";

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;
    private final Map<String, RateWindow> counters = new ConcurrentHashMap<>();

    public ApiRateLimitFilter(AppProperties appProperties, ObjectMapper objectMapper) {
        this.appProperties = appProperties;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        int limit = resolveLimit(request);
        if (limit <= 0) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = request.getMethod() + ":" + request.getRequestURI() + ":" + extractClientKey(request);
        long currentWindow = System.currentTimeMillis() / 60_000L;

        RateWindow rateWindow = counters.compute(key, (ignored, existing) -> {
            if (existing == null || existing.windowMinute() != currentWindow) {
                return new RateWindow(currentWindow, new AtomicInteger(1));
            }

            existing.counter().incrementAndGet();
            return existing;
        });

        if (rateWindow.counter().get() > limit) {
            writeRateLimitExceeded(response, request);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private int resolveLimit(HttpServletRequest request) {
        if (!HttpMethod.POST.matches(request.getMethod())) {
            return 0;
        }

        String path = request.getRequestURI();
        if (LOGIN_PATH.equals(path) || REGISTER_PATH.equals(path)) {
            return appProperties.getRateLimit().getAuthRequestsPerMinute();
        }

        if (UPLOAD_PATH.equals(path)) {
            return appProperties.getRateLimit().getUploadRequestsPerMinute();
        }

        return 0;
    }

    private String extractClientKey(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void writeRateLimitExceeded(HttpServletResponse response, HttpServletRequest request) throws IOException {
        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                HttpStatus.TOO_MANY_REQUESTS.value(),
                HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase(),
                "Too many requests. Please wait a minute and try again.",
                request.getRequestURI(),
                List.of()
        );

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", "60");
        objectMapper.writeValue(response.getOutputStream(), body);
    }

    private record RateWindow(long windowMinute, AtomicInteger counter) {
    }
}
