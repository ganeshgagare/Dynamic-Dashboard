package com.dashboard.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/datasource")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class DataSourceController {

    private final List<String> allowedHosts;

    public DataSourceController(
            @Value("${app.datasource.allowed-hosts}") String allowedHostsCsv) {
        this.allowedHosts = Arrays.stream(allowedHostsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    /** Test a database connection. Requires Admin role; host must be in the allowed list. */
    @PostMapping("/test")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> testConnection(@RequestBody Map<String, String> payload) {
        String url      = payload.get("url");
        String username = payload.get("username");
        String password = payload.get("password");

        if (url == null || username == null || password == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Missing credentials"));
        }

        // Extract the hostname from the JDBC URL and verify it is on the allow-list
        String host = extractHost(url);
        if (host == null || !allowedHosts.contains(host)) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false,
                            "message", "Connection to host '" + host + "' is not permitted."));
        }

        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            return ResponseEntity.status(500)
                    .body(Map.of("success", false, "message", "PostgreSQL driver not found on server"));
        }

        try (Connection conn = DriverManager.getConnection(url, username, password)) {
            if (!conn.isValid(5)) {
                return ResponseEntity.status(400)
                        .body(Map.of("success", false, "message", "Connection timeout or invalid."));
            }

            List<Map<String, Object>> records = new java.util.ArrayList<>();
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
            } catch (Exception ignored) {
                // Table might not exist; connection is still valid
            }

            return ResponseEntity.ok(
                    Map.of("success", true, "message", "Connection successful!", "data", records));

        } catch (SQLException e) {
            return ResponseEntity.status(400)
                    .body(Map.of("success", false, "message", "Connection failed: " + e.getMessage()));
        }
    }

    /** Inspect a database schema. Returns tables and their columns. */
    @PostMapping("/inspect")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> inspectConnection(@RequestBody Map<String, String> payload) {
        String url      = payload.get("url");
        String username = payload.get("username");
        String password = payload.get("password");

        if (url == null || username == null || password == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Missing credentials"));
        }

        String host = extractHost(url);
        if (host == null || !allowedHosts.contains(host)) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Host not permitted."));
        }

        try (Connection conn = DriverManager.getConnection(url, username, password)) {
            java.sql.DatabaseMetaData metaData = conn.getMetaData();
            
            // Map to store Table Name -> List of Columns
            Map<String, List<String>> schema = new java.util.TreeMap<>();

            // 1. Get all user tables
            try (java.sql.ResultSet tables = metaData.getTables(null, "public", "%", new String[]{"TABLE"})) {
                while (tables.next()) {
                    String tableName = tables.getString("TABLE_NAME");
                    List<String> columnsList = new java.util.ArrayList<>();
                    
                    // 2. For each table, get all columns
                    try (java.sql.ResultSet columns = metaData.getColumns(null, null, tableName, "%")) {
                        while (columns.next()) {
                            columnsList.add(columns.getString("COLUMN_NAME"));
                        }
                    }
                    schema.put(tableName, columnsList);
                }
            }

            return ResponseEntity.ok(Map.of("success", true, "schema", schema));

        } catch (SQLException e) {
            return ResponseEntity.status(400)
                    .body(Map.of("success", false, "message", "Inspection failed: " + e.getMessage()));
        }
    }

    /** Extract the hostname from a JDBC URL (jdbc:postgresql://host:port/db). */
    private String extractHost(String jdbcUrl) {
        try {
            // Strip "jdbc:" prefix so URI can parse it
            String uri = jdbcUrl.startsWith("jdbc:") ? jdbcUrl.substring(5) : jdbcUrl;
            return URI.create(uri).getHost();
        } catch (Exception e) {
            return null;
        }
    }
}

