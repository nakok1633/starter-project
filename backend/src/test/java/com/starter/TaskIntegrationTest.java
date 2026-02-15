package com.starter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.starter.dto.*;
import com.starter.entity.Role;
import com.starter.entity.User;
import com.starter.repository.RefreshTokenRepository;
import com.starter.repository.TaskRepository;
import com.starter.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class TaskIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String accessToken;
    private User testUser;

    @BeforeEach
    void setUp() throws Exception {
        refreshTokenRepository.deleteAll();
        taskRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user
        testUser = User.builder()
                .email("test@example.com")
                .password(passwordEncoder.encode("password123"))
                .name("Test User")
                .role(Role.USER)
                .build();
        testUser = userRepository.save(testUser);

        // Login to get access token
        LoginRequest loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                result.getResponse().getContentAsString(), AuthResponse.class);
        accessToken = authResponse.getAccessToken();
    }

    @Test
    void shouldCreateReadUpdateDeleteTask() throws Exception {
        // Create task
        TaskRequest createRequest = TaskRequest.builder()
                .title("Test Task")
                .description("Test Description")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Task"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        TaskResponse createdTask = objectMapper.readValue(
                createResult.getResponse().getContentAsString(), TaskResponse.class);
        Long taskId = createdTask.getId();

        // Read task
        mockMvc.perform(get("/api/tasks/" + taskId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(taskId))
                .andExpect(jsonPath("$.title").value("Test Task"));

        // Update task
        TaskRequest updateRequest = TaskRequest.builder()
                .title("Updated Task")
                .description("Updated Description")
                .build();

        mockMvc.perform(put("/api/tasks/" + taskId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Task"))
                .andExpect(jsonPath("$.description").value("Updated Description"));

        // List tasks
        mockMvc.perform(get("/api/tasks")
                        .header("Authorization", "Bearer " + accessToken)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(taskId));

        // Delete task
        mockMvc.perform(delete("/api/tasks/" + taskId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());

        // Verify deletion
        mockMvc.perform(get("/api/tasks/" + taskId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnUnauthorizedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }
}
