package com.stockpilot.service;

import com.stockpilot.dto.request.AuthRequest;
import com.stockpilot.dto.request.RegisterRequest;
import com.stockpilot.dto.response.AuthResponse;
import com.stockpilot.entity.User;
import com.stockpilot.entity.Role;
import com.stockpilot.repository.UserRepository;
import com.stockpilot.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditLogService auditLog;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByUsername(req.username()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = User.builder()
            .username(req.username())
            .passwordHash(passwordEncoder.encode(req.password()))
            .role(req.role())
            .build();

        User savedUser = userRepository.save(user);
        auditLog.record("REGISTER", "User", savedUser.getId(), "Registered new user: " + savedUser.getUsername() + " with role: " + savedUser.getRole());

        String token = jwtUtil.generate(savedUser.getUsername(), savedUser.getRole().name());
        return new AuthResponse(token, savedUser.getUsername(), savedUser.getRole().name());
    }

    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByUsername(req.username())
            .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        auditLog.record("LOGIN", "User", user.getId(), "User logged in: " + user.getUsername());
        String token = jwtUtil.generate(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }
}
