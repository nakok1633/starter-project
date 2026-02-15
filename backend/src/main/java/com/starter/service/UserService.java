package com.starter.service;

import com.starter.dto.UpdateUserRequest;
import com.starter.dto.UserResponse;
import com.starter.entity.User;
import com.starter.exception.BadRequestException;
import com.starter.exception.ResourceNotFoundException;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 서비스
 * 사용자 정보 조회 및 수정 관련 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 사용자 정보 조회
     * @param userId 사용자 ID
     * @return 사용자 정보 응답
     */
    @Transactional(readOnly = true)
    public UserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserResponse.from(user);
    }
    
    /**
     * 사용자 정보 수정
     * @param userId 사용자 ID
     * @param request 수정 요청 (이름, 비밀번호)
     * @return 수정된 사용자 정보
     */
    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // 이름 변경
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        
        // 비밀번호 변경 (현재 비밀번호 검증 필요)
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            // 현재 비밀번호 확인
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new BadRequestException("현재 비밀번호를 입력해주세요");
            }
            
            // 현재 비밀번호 검증
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("현재 비밀번호가 일치하지 않습니다");
            }
            
            // 새 비밀번호 설정
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        
        user = userRepository.save(user);
        return UserResponse.from(user);
    }
}
