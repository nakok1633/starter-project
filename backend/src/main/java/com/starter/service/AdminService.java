package com.starter.service;

import com.starter.dto.AdminDashboardResponse;
import com.starter.dto.AdminUserResponse;
import com.starter.dto.AdminUserUpdateRequest;
import com.starter.dto.PageResponse;
import com.starter.entity.TaskStatus;
import com.starter.entity.User;
import com.starter.entity.UserStatus;
import com.starter.exception.ResourceNotFoundException;
import com.starter.repository.TaskRepository;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자 기능 서비스
 * - 사용자 관리, 대시보드 통계 등 관리자 전용 기능 제공
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    /**
     * 대시보드 통계 조회
     * - 전체 사용자 수, 상태별 사용자 수, Task 통계 등
     */
    public AdminDashboardResponse getDashboardStats() {
        // 오늘 시작 시간 계산
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        return AdminDashboardResponse.builder()
                .totalUsers(userRepository.count())
                .activeUsers(userRepository.countByStatus(UserStatus.ACTIVE))
                .inactiveUsers(userRepository.countByStatus(UserStatus.INACTIVE))
                .suspendedUsers(userRepository.countByStatus(UserStatus.SUSPENDED))
                .totalTasks(taskRepository.count())
                .todoTasks(taskRepository.countByStatus(TaskStatus.TODO))
                .inProgressTasks(taskRepository.countByStatus(TaskStatus.IN_PROGRESS))
                .doneTasks(taskRepository.countByStatus(TaskStatus.DONE))
                .todayNewUsers(userRepository.countByCreatedAtAfter(todayStart))
                .build();
    }

    /**
     * 사용자 목록 조회 (페이징, 검색)
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     * @param search 검색어 (이메일, 이름)
     * @param sortBy 정렬 기준
     * @param sortDir 정렬 방향 (asc, desc)
     */
    public PageResponse<AdminUserResponse> getUsers(int page, int size, String search, 
                                                     String sortBy, String sortDir) {
        // 정렬 설정
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") 
                ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        // 검색어가 있으면 검색, 없으면 전체 조회
        Page<User> userPage;
        if (search != null && !search.trim().isEmpty()) {
            userPage = userRepository.findAllWithSearch(search.trim(), pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        // User -> AdminUserResponse 변환
        List<AdminUserResponse> users = userPage.getContent().stream()
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());

        return PageResponse.<AdminUserResponse>builder()
                .content(users)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .build();
    }

    /**
     * 특정 사용자 조회
     * @param userId 사용자 ID
     */
    public AdminUserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        return toAdminUserResponse(user);
    }

    /**
     * 사용자 정보 수정 (역할, 상태)
     * @param userId 사용자 ID
     * @param request 수정 요청
     */
    @Transactional
    public AdminUserResponse updateUser(Long userId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        user.setRole(request.getRole());
        user.setStatus(request.getStatus());
        
        User savedUser = userRepository.save(user);
        return toAdminUserResponse(savedUser);
    }

    /**
     * 사용자 삭제
     * @param userId 사용자 ID
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        userRepository.delete(user);
    }

    /**
     * User 엔티티를 AdminUserResponse DTO로 변환
     */
    private AdminUserResponse toAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
