package com.starter.dto;

import com.starter.entity.Role;
import com.starter.entity.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 관리자용 사용자 수정 요청 DTO
 * - 관리자가 사용자 정보(역할, 상태)를 수정할 때 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserUpdateRequest {
    @NotNull(message = "역할은 필수입니다")
    private Role role;         // 역할 (USER, ADMIN)

    @NotNull(message = "상태는 필수입니다")
    private UserStatus status; // 상태 (ACTIVE, INACTIVE, SUSPENDED)
}
