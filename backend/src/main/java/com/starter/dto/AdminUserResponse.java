package com.starter.dto;

import com.starter.entity.Role;
import com.starter.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 관리자용 사용자 응답 DTO
 * - 관리자 페이지에서 사용자 정보를 표시할 때 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Long id;           // 사용자 ID
    private String email;      // 이메일
    private String name;       // 이름
    private Role role;         // 역할 (USER, ADMIN)
    private UserStatus status; // 상태 (ACTIVE, INACTIVE, SUSPENDED)
    private LocalDateTime createdAt;  // 가입일
    private LocalDateTime updatedAt;  // 수정일
}
