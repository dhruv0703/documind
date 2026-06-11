package com.dhruv.documind.service;

import org.springframework.security.core.userdetails.UserDetails;

import com.dhruv.documind.entity.User;

public interface JwtService {

    String generateToken(User user);

    String extractUsername(String token);

    boolean isTokenValid(String token, UserDetails userDetails);
}
