package com.starter.service;

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

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
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

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> getTasks(int page, int size, String search, String sortBy, String sortDir) {
        User currentUser = securityUtils.getCurrentUser();
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Task> taskPage;
        if (securityUtils.isAdmin()) {
            // Admin can see all tasks
            if (search != null && !search.isBlank()) {
                taskPage = taskRepository.findAllWithSearch(search, pageable);
            } else {
                taskPage = taskRepository.findAll(pageable);
            }
        } else {
            // Regular users can only see their own tasks
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

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = findTaskAndCheckAccess(id);
        return TaskResponse.fromEntity(task);
    }

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

    @Transactional
    public void deleteTask(Long id) {
        Task task = findTaskAndCheckAccess(id);
        taskRepository.delete(task);
    }

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
