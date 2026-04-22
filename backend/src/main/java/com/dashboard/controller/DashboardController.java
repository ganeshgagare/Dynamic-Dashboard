package com.dashboard.controller;

import com.dashboard.model.Task;
import com.dashboard.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class DashboardController {

    private final TaskService service;

    public DashboardController(TaskService service) {
        this.service = service;
    }

    /** Main endpoint: returns all tasks (with optional filters) */
    @GetMapping("/dashboard-data")
    public ResponseEntity<List<Task>> getDashboardData(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        List<Task> data = (status == null && category == null && from == null && to == null)
                ? service.getAll()
                : service.getFiltered(status, category, from, to);
        return ResponseEntity.ok(data);
    }

    /** Status aggregation summary */
    @GetMapping("/dashboard-data/status-summary")
    public ResponseEntity<List<Map<String, Object>>> getStatusSummary() {
        List<Map<String, Object>> result = service.statusSummary().stream()
                .map(row -> Map.of("status", row[0], "count", row[1]))
                .toList();
        return ResponseEntity.ok(result);
    }

    /** Category aggregation summary */
    @GetMapping("/dashboard-data/category-summary")
    public ResponseEntity<List<Map<String, Object>>> getCategorySummary() {
        List<Map<String, Object>> result = service.categorySummary().stream()
                .map(row -> Map.of("category", row[0], "count", row[1], "totalValue", row[2]))
                .toList();
        return ResponseEntity.ok(result);
    }

    /** Create task */
    @PostMapping("/dashboard-data")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        return ResponseEntity.ok(service.save(task));
    }

    /** Delete task */
    @DeleteMapping("/dashboard-data/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
