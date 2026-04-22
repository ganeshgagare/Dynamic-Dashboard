package com.dashboard.controller;

import com.dashboard.model.User;
import com.dashboard.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String name     = required(body, "name");
            String email    = required(body, "email");
            String password = required(body, "password");
            String role     = body.getOrDefault("role", "Viewer");

            User user = authService.register(name, email, password, role);
            return ResponseEntity.ok(safeUser(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email    = required(body, "email");
            String password = required(body, "password");

            User user = authService.login(email, password);
            return ResponseEntity.ok(safeUser(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/update/{id}/prefs")
    public ResponseEntity<?> updatePreferences(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String prefs = required(body, "preferences");
            User user = authService.updatePreferences(id, prefs);
            return ResponseEntity.ok(safeUser(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/update/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String oldPassword = required(body, "oldPassword");
            String newPassword = required(body, "newPassword");
            
            User user = authService.updatePassword(id, oldPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Return user info WITHOUT the hashed password
    private Map<String, Object> safeUser(User u) {
        return Map.of(
            "id",    u.getId(),
            "name",  u.getName(),
            "email", u.getEmail(),
            "role",  u.getRole(),
            "preferences", u.getPreferences() != null ? u.getPreferences() : "{}"
        );
    }

    private String required(Map<String, String> body, String key) {
        String val = body.get(key);
        if (val == null || val.isBlank()) throw new IllegalArgumentException(key + " is required.");
        return val.trim();
    }
    
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String name  = required(body, "name");
            String email = required(body, "email");
            
            User user = authService.updateProfile(id, name, email);
            return ResponseEntity.ok(safeUser(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
