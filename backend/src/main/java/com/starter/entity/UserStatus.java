package com.starter.entity;

/**
 * 사용자 상태 Enum
 * - ACTIVE: 활성 (정상 사용 가능)
 * - INACTIVE: 비활성 (휴면 계정)
 * - SUSPENDED: 정지 (관리자에 의해 차단됨)
 */
public enum UserStatus {
    ACTIVE,     // 활성
    INACTIVE,   // 비활성
    SUSPENDED   // 정지
}
