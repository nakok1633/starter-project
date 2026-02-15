package com.starter.repository;

import com.starter.entity.User;
import com.starter.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // 상태별 사용자 수 조회
    long countByStatus(UserStatus status);
    
    // 특정 날짜 이후 가입한 사용자 수 조회
    long countByCreatedAtAfter(LocalDateTime dateTime);
    
    // 검색 기능이 포함된 사용자 목록 조회 (이메일, 이름으로 검색)
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<User> findAllWithSearch(@Param("search") String search, Pageable pageable);
}
