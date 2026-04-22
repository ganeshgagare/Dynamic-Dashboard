package com.dashboard.repository;

import com.dashboard.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(String status);

    List<Task> findByCategory(String category);

    List<Task> findByStatusAndCategory(String status, String category);

    List<Task> findByDateBetween(LocalDate from, LocalDate to);

    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:from IS NULL OR t.date >= :from) AND " +
           "(:to IS NULL OR t.date <= :to)")
    List<Task> findFiltered(
        @Param("status") String status,
        @Param("category") String category,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("SELECT t.status, COUNT(t) FROM Task t GROUP BY t.status")
    List<Object[]> countByStatus();

    @Query("SELECT t.category, COUNT(t), SUM(t.value) FROM Task t GROUP BY t.category")
    List<Object[]> aggregateByCategory();
}
