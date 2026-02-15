package com.starter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 관리자 대시보드 통계 응답 DTO
 * - 대시보드에 표시할 각종 통계 정보
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;        // 전체 사용자 수
    private long activeUsers;       // 활성 사용자 수
    private long inactiveUsers;     // 비활성 사용자 수
    private long suspendedUsers;    // 정지된 사용자 수
    private long totalTasks;        // 전체 Task 수
    private long todoTasks;         // TODO 상태 Task 수
    private long inProgressTasks;   // IN_PROGRESS 상태 Task 수
    private long doneTasks;         // DONE 상태 Task 수
    private long todayNewUsers;     // 오늘 가입한 사용자 수
}
