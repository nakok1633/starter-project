package com.starter.service;

/**
 * 태스크 서비스
 * 태스크 CRUD 및 검색, 페이지네이션 제공
 * 본인 태스크만 접근 가능 (Admin은 전체 접근 가능)
 */

import com.starter.dto.PageResponse;
import com.starter.dto.TaskRequest;
import com.starter.dto.TaskResponse;
import com.starter.entity.Task;
import com.starter.entity.TaskPriority;
import com.starter.entity.TaskStatus;
import com.starter.entity.User;
import com.starter.exception.ResourceNotFoundException;
import com.starter.exception.UnauthorizedException;
import com.starter.repository.TaskRepository;
import com.starter.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final SecurityUtils securityUtils;

    /**
     * 태스크 생성
     * @param request 태스크 생성 요청 (제목, 설명, 상태, 우선순위)
     * @return 생성된 태스크 응답
     */
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        // 현재 로그인한 사용자를 태스크 담당자로 설정
        User currentUser = securityUtils.getCurrentUser();

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.PENDING)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .user(currentUser)
                .build();

        task = taskRepository.save(task);
        return TaskResponse.fromEntity(task);
    }

    /**
     * 태스크 목록 조회 (페이지네이션, 검색, 정렬 지원)
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     * @param search 검색어 (제목/설명)
     * @param sortBy 정렬 기준 필드
     * @param sortDir 정렬 방향 (asc/desc)
     * @return 페이지네이션된 태스크 목록
     */
    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> getTasks(int page, int size, String search, String sortBy, String sortDir) {
        User currentUser = securityUtils.getCurrentUser();
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Task> taskPage;
        if (securityUtils.isAdmin()) {
            // Admin은 모든 태스크 조회 가능
            if (search != null && !search.isBlank()) {
                taskPage = taskRepository.findAllWithSearch(search, pageable);
            } else {
                taskPage = taskRepository.findAll(pageable);
            }
        } else {
            // 일반 사용자는 본인 태스크만 조회 가능
            if (search != null && !search.isBlank()) {
                taskPage = taskRepository.findByUserAndSearch(currentUser, search, pageable);
            } else {
                taskPage = taskRepository.findByUser(currentUser, pageable);
            }
        }

        return PageResponse.<TaskResponse>builder()
                .content(taskPage.getContent().stream()
                        .map(TaskResponse::fromEntity)
                        .collect(Collectors.toList()))
                .page(taskPage.getNumber())
                .size(taskPage.getSize())
                .totalElements(taskPage.getTotalElements())
                .totalPages(taskPage.getTotalPages())
                .first(taskPage.isFirst())
                .last(taskPage.isLast())
                .build();
    }

    /**
     * 태스크 단건 조회
     * @param id 태스크 ID
     * @return 태스크 상세 정보
     */
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = findTaskAndCheckAccess(id);
        return TaskResponse.fromEntity(task);
    }

    /**
     * 태스크 수정
     * @param id 태스크 ID
     * @param request 수정할 내용
     * @return 수정된 태스크 응답
     */
    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findTaskAndCheckAccess(id);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        task = taskRepository.save(task);
        return TaskResponse.fromEntity(task);
    }

    /**
     * 태스크 삭제
     * @param id 삭제할 태스크 ID
     */
    @Transactional
    public void deleteTask(Long id) {
        Task task = findTaskAndCheckAccess(id);
        taskRepository.delete(task);
    }

    /**
     * 태스크 조회 및 접근 권한 확인 (내부 헬퍼)
     * @param id 태스크 ID
     * @return 태스크 엔티티
     * @throws ResourceNotFoundException 태스크가 없을 경우
     * @throws UnauthorizedException 접근 권한이 없을 경우
     */
    private Task findTaskAndCheckAccess(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));

        User currentUser = securityUtils.getCurrentUser();
        if (!securityUtils.isAdmin() && !task.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You don't have permission to access this task");
        }

        return task;
    }
}
