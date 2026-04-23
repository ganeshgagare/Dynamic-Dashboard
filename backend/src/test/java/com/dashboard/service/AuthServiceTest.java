package com.dashboard.service;

import com.dashboard.model.User;
import com.dashboard.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepo;

    @Mock
    private PasswordEncoder encoder;

    @InjectMocks
    private AuthService authService;

    private final BCryptPasswordEncoder realEncoder = new BCryptPasswordEncoder();

    @Test
    void register_newUser_savesAndReturnsUser() {
        when(userRepo.existsByEmail("test@example.com")).thenReturn(false);
        when(encoder.encode("secret")).thenReturn("hashed");
        User saved = new User("Alice", "test@example.com", "hashed", "Viewer");
        when(userRepo.save(any(User.class))).thenReturn(saved);

        User result = authService.register("Alice", "test@example.com", "secret", "Viewer");

        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getRole()).isEqualTo("Viewer");
        verify(userRepo).save(any(User.class));
    }

    @Test
    void register_duplicateEmail_throwsIllegalArgumentException() {
        when(userRepo.existsByEmail("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register("Bob", "dup@example.com", "pass", "Viewer"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    void login_correctCredentials_returnsUser() {
        String raw = "password123";
        String hash = realEncoder.encode(raw);
        User user = new User("Alice", "alice@example.com", hash, "Viewer");
        when(userRepo.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(encoder.matches(raw, hash)).thenReturn(true);

        User result = authService.login("alice@example.com", raw);

        assertThat(result.getName()).isEqualTo("Alice");
    }

    @Test
    void login_wrongPassword_throwsIllegalArgumentException() {
        User user = new User("Alice", "alice@example.com", "hashed", "Viewer");
        when(userRepo.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(encoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login("alice@example.com", "wrong"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Incorrect password");
    }

    @Test
    void login_unknownEmail_throwsIllegalArgumentException() {
        when(userRepo.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login("nobody@example.com", "pass"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No account found");
    }
}
