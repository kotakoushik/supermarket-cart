package com.supermarket.cart.controller;

import com.supermarket.cart.dto.AdminAuthResponseDTO;
import com.supermarket.cart.dto.AdminLoginRequestDTO;
import com.supermarket.cart.service.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<AdminAuthResponseDTO> login(@Valid @RequestBody AdminLoginRequestDTO request) {
        AdminAuthResponseDTO response = adminAuthService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKeyHeader) {
        String token = adminKeyHeader != null && !adminKeyHeader.isBlank() ? adminKeyHeader : authHeader;
        adminAuthService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Admin logged out successfully"));
    }
}
