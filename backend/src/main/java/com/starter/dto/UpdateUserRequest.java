package com.starter.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 사용자 정보 수정 요청 DTO
 * 모든 필드는 선택사항 (null이면 변경하지 않음)
 */
@Data
public class UpdateUserRequest {
    
    @Size(min = 2, max = 100, message = "이름은 2~100자 사이여야 합니다")
    private String name;
    
    @Size(min = 6, message = "비밀번호는 최소 6자 이상이어야 합니다")
    private String currentPassword;
    
    @Size(min = 6, message = "새 비밀번호는 최소 6자 이상이어야 합니다")
    private String newPassword;
}
