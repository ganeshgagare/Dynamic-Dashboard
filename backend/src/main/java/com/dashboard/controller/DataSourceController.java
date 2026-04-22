package com.dashboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Map;

@RestController
@RequestMapping("/api/datasource")
@CrossOrigin(origins = "*")
public class DataSourceController {

    @PostMapping("/test")
    public ResponseEntity<?> testConnection(@RequestBody Map<String, String> payload) {
        String url = payload.get("url");
        String username = payload.get("username");
        String password = payload.get("password");

        if (url == null || username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing credentials"));
        }

        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "PostgreSQL driver not found on server"));
        }

        try (Connection conn = DriverManager.getConnection(url, username, password)) {
            if (conn.isValid(5)) {
                // Fetch data from tasks table
                java.util.List<Map<String, Object>> records = new java.util.ArrayList<>();
                try (java.sql.Statement stmt = conn.createStatement();
                     java.sql.ResultSet rs = stmt.executeQuery("SELECT * FROM tasks ORDER BY id DESC")) {
                    java.sql.ResultSetMetaData meta = rs.getMetaData();
                    int cols = meta.getColumnCount();
                    while (rs.next()) {
                        Map<String, Object> row = new java.util.HashMap<>();
                        for (int i = 1; i <= cols; i++) {
                            row.put(meta.getColumnName(i), rs.getObject(i));
                        }
                        records.add(row);
                    }
                } catch (Exception ignored) {} // Table might not exist, but connection is valid
                
                return ResponseEntity.ok(Map.of("success", true, "message", "Connection successful!", "data", records));
            } else {
                return ResponseEntity.status(400).body(Map.of("success", false, "message", "Connection timeout or invalid."));
            }
        } catch (SQLException e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Connection failed: " + e.getMessage()));
        }
    }
}
