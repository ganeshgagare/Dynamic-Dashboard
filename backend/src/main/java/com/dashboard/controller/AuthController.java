package com.dashboard.controller;

import com.dashboard.dto.LoginRequest;
import com.dashboard.dto.RegisterRequest;
import com.dashboard.model.User;
import com.dashboard.security.JwtUtil;
import com.dashboard.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil     jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil     = jwtUtil;
    }

    /** Public: register a new user. Role is always set to "Viewer" for self-registration. */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest body) {
        User user = authService.register(
                body.getName(), body.getEmail(), body.getPassword(), "Viewer");
        authService.generateOtp(user);
        return ResponseEntity.ok(Map.of("otpRequired", true, "email", user.getEmail()));
    }

    /** Public: authenticate and receive a JWT. */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest body) {
        User user = authService.login(body.getEmail(), body.getPassword());
        authService.generateOtp(user);
        return ResponseEntity.ok(Map.of("otpRequired", true, "email", user.getEmail()));
    }

    /** Public: verify OTP and issue JWT. */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        try {
            String email = required(body, "email");
            String otp   = required(body, "otp");
            User user = authService.verifyOtp(email, otp);
            String token = jwtUtil.generateToken(user);
            return ResponseEntity.ok(buildAuthResponse(user, token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Protected: update display name and email. */
    @PutMapping("/update/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(@PathVariable Long id,
                                            @RequestBody Map<String, String> body) {
        String name  = required(body, "name");
        String email = required(body, "email");
        User user = authService.updateProfile(id, name, email);
        return ResponseEntity.ok(safeUser(user));
    }

    /** Protected: update dashboard/notification preferences. */
    @PutMapping("/update/{id}/prefs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updatePreferences(@PathVariable Long id,
                                                @RequestBody Map<String, String> body) {
        String prefs = required(body, "preferences");
        User user = authService.updatePreferences(id, prefs);
        return ResponseEntity.ok(safeUser(user));
    }

    /** Protected: change password. */
    @PutMapping("/update/{id}/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updatePassword(@PathVariable Long id,
                                             @RequestBody Map<String, String> body) {
        String oldPassword = required(body, "oldPassword");
        String newPassword = required(body, "newPassword");
        authService.updatePassword(id, oldPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    /** Admin-only: assign a privileged role to an existing user. */
    @PutMapping("/update/{id}/role")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> updateRole(@PathVariable Long id,
                                         @RequestBody Map<String, String> body) {
        String role = required(body, "role");
        User user = authService.updateRole(id, role);
        return ResponseEntity.ok(safeUser(user));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Map<String, Object> buildAuthResponse(User u, String token) {
        return Map.of(
            "token",       token,
            "id",          u.getId(),
            "name",        u.getName(),
            "email",       u.getEmail(),
            "role",        u.getRole(),
            "preferences", u.getPreferences() != null ? u.getPreferences() : "{}"
        );
    }

    private Map<String, Object> safeUser(User u) {
        return Map.of(
            "id",          u.getId(),
            "name",        u.getName(),
            "email",       u.getEmail(),
            "role",        u.getRole(),
            "preferences", u.getPreferences() != null ? u.getPreferences() : "{}"
        );
    }

    private String required(Map<String, String> body, String key) {
        String val = body.get(key);
        if (val == null || val.isBlank()) throw new IllegalArgumentException(key + " is required.");
        return val.trim();
    }
}

