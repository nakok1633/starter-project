package com.starter.repository;

import com.starter.entity.Task;
import com.starter.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findByUser(User user, Pageable pageable);
    
    @Query("SELECT t FROM Task t WHERE t.user = :user AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> findByUserAndSearch(@Param("user") User user, 
                                    @Param("search") String search, 
                                    Pageable pageable);
    
    @Query("SELECT t FROM Task t WHERE " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> findAllWithSearch(@Param("search") String search, Pageable pageable);
}
