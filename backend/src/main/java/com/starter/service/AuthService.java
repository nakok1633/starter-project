package com.starter.service;

/**
 * 인증 서비스
 * 회원가입, 로그인, 토큰 갱신, 로그아웃 등 인증 관련 비즈니스 로직 처리
 */

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

    /**
     * 회원가입
     * @param request 회원가입 요청 (이메일, 비밀번호, 이름)
     * @return 인증 응답 (액세스 토큰, 리프레시 토큰, 사용자 정보)
     */
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // 이메일 중복 확인
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

    /**
     * 로그인
     * @param request 로그인 요청 (이메일, 비밀번호)
     * @return 인증 응답 (액세스 토큰, 리프레시 토큰, 사용자 정보)
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Spring Security 인증 처리
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        // 기존 리프레시 토큰 삭제 (한 계정당 하나의 세션만 유지)
        refreshTokenRepository.deleteByUser(user);

        return createAuthResponse(user);
    }

    /**
     * 토큰 갱신
     * @param request 토큰 갱신 요청 (리프레시 토큰)
     * @return 새로운 인증 응답 (새 액세스 토큰, 새 리프레시 토큰)
     */
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        // 리프레시 토큰 유효성 검증
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        // 토큰 만료 확인
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token has expired");
        }

        User user = refreshToken.getUser();

        // 기존 리프레시 토큰 삭제 (재사용 방지)
        refreshTokenRepository.delete(refreshToken);

        return createAuthResponse(user);
    }

    /**
     * 로그아웃
     * @param refreshToken 삭제할 리프레시 토큰
     */
    @Transactional
    public void logout(String refreshToken) {
        // 리프레시 토큰 삭제로 세션 종료
        refreshTokenRepository.deleteByToken(refreshToken);
    }

    /**
     * 인증 응답 생성 (내부 헬퍼 메서드)
     * 액세스 토큰, 리프레시 토큰 생성 및 DB 저장
     */
    private AuthResponse createAuthResponse(User user) {
        // JWT 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        // 리프레시 토큰 DB 저장
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
