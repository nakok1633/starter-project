package com.starter.service;

import com.starter.dto.*;
import com.starter.entity.RefreshToken;
import com.starter.entity.Role;
import com.starter.entity.User;
import com.starter.exception.BadRequestException;
import com.starter.exception.UnauthorizedException;
import com.starter.repository.RefreshTokenRepository;
import com.starter.repository.UserRepository;
import com.starter.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(Role.USER)
                .build();

        user = userRepository.save(user);

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        // Delete existing refresh tokens for this user
        refreshTokenRepository.deleteByUser(user);

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token has expired");
        }

        User user = refreshToken.getUser();

        // Delete old refresh token
        refreshTokenRepository.delete(refreshToken);

        return createAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.deleteByToken(refreshToken);
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        // Save refresh token
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiryDate(Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiration()))
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration() / 1000)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
