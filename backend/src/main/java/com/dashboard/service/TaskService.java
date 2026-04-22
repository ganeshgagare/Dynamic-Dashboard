package com.dashboard.service;

import com.dashboard.model.Task;
import com.dashboard.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository repo;

    public TaskService(TaskRepository repo) {
        this.repo = repo;
    }

    public List<Task> getAll() {
        return repo.findAll();
    }

    public List<Task> getFiltered(String status, String category, String from, String to) {
        LocalDate fromDate = from != null && !from.isBlank() ? LocalDate.parse(from) : null;
        LocalDate toDate   = to   != null && !to.isBlank()   ? LocalDate.parse(to)   : null;
        String s = (status   != null && !status.isBlank()   && !status.equalsIgnoreCase("All"))   ? status   : null;
        String c = (category != null && !category.isBlank() && !category.equalsIgnoreCase("All")) ? category : null;
        return repo.findFiltered(s, c, fromDate, toDate);
    }

    public Task save(Task task) {
        return repo.save(task);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<Object[]> statusSummary() {
        return repo.countByStatus();
    }

    public List<Object[]> categorySummary() {
        return repo.aggregateByCategory();
    }
}
