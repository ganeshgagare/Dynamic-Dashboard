package com.dashboard.service;

import com.dashboard.model.User;
import com.dashboard.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder  = encoder;
    }

    /** Register a new user. Returns saved User or throws if email already exists. */
    public User register(String name, String email, String rawPassword, String role) {
        if (userRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered: " + email);
        }
        if ("Admin".equalsIgnoreCase(role) && userRepo.existsByRole("Admin")) {
            throw new IllegalArgumentException("An Admin account already exists. Only one Admin is allowed.");
        }
        
        String hashed = encoder.encode(rawPassword);
        User user = new User(name, email, hashed, role);
        return userRepo.save(user);
    }

    /** Login: returns User if credentials match, otherwise throws. */
    public User login(String email, String rawPassword) {
        Optional<User> opt = userRepo.findByEmail(email);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("No account found with this email.");
        }
        User user = opt.get();
        if (!encoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Incorrect password.");
        }
        return user;
    }

    /** Generate a 6-digit OTP and set it to expire in 5 minutes. */
    public String generateOtp(User user) {
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(5));
        userRepo.save(user);
        
        // In a real app, you would send this via email/SMS here.
        System.out.println(">>> DEBUG OTP for " + user.getEmail() + " is: " + otp);
        
        return otp;
    }

    /** Verify OTP. Returns User if valid, throws otherwise. */
    public User verifyOtp(String email, String otp) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP.");
        }
        
        if (user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired.");
        }
        
        // Clear OTP after successful verification
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        return userRepo.save(user);
    }
    public User updateProfile(Long id, String name, String email) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // If email is changed, ensure the new email is not already taken
        if (!user.getEmail().equalsIgnoreCase(email) && userRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered by another user.");
        }
        
        user.setName(name);
        user.setEmail(email);
        return userRepo.save(user);
    }
    public User updatePreferences(Long id, String preferences) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPreferences(preferences);
        return userRepo.save(user);
    }

    public User updatePassword(Long id, String oldPassword, String newPassword) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!encoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        
        user.setPassword(encoder.encode(newPassword));
        return userRepo.save(user);
    }

    /** Admin-only: assign a role to any user. */
    public User updateRole(Long id, String role) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(role);
        return userRepo.save(user);
    }
}
