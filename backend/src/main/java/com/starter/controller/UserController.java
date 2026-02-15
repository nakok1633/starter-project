package com.starter.controller;

import com.starter.dto.UpdateUserRequest;
import com.starter.dto.UserResponse;
import com.starter.security.SecurityUtils;
import com.starter.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자 컨트롤러
 * 사용자 정보 조회 및 수정 API
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final SecurityUtils securityUtils;
    
    /**
     * 현재 로그인한 사용자 정보 조회
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Long userId = securityUtils.getCurrentUser().getId();
        UserResponse response = userService.getUser(userId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 현재 로그인한 사용자 정보 수정
     * PUT /api/users/me
     */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(@Valid @RequestBody UpdateUserRequest request) {
        Long userId = securityUtils.getCurrentUser().getId();
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }
}
