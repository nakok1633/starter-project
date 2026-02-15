package com.starter.dto;

import com.starter.entity.Task;
import com.starter.entity.TaskPriority;
import com.starter.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .userId(task.getUser().getId())
                .userName(task.getUser().getName())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
