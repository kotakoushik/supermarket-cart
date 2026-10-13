package com.supermarket.cart.service;

import com.supermarket.cart.dto.AdminAuthResponseDTO;
import com.supermarket.cart.dto.AdminLoginRequestDTO;
import com.supermarket.cart.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminAuthService {

    @Value("${freshcart.admin.username:${FRESHCART_ADMIN_USERNAME:admin}}")
    private String configuredUsername;

    @Value("${freshcart.admin.password:${FRESHCART_ADMIN_PASSWORD:admin123}}")
    private String configuredPassword;

    @Value("${freshcart.admin.key:${FRESHCART_ADMIN_KEY:fc-admin-key-2025}}")
    private String configuredKey;

    // Active admin session tokens
    private final Set<String> activeAdminTokens = ConcurrentHashMap.newKeySet();

    public AdminAuthResponseDTO login(AdminLoginRequestDTO request) {
        if (request == null || request.getUsername() == null || request.getPassword() == null) {
            throw new UnauthorizedException("Username and password are required");
        }
        String username = request.getUsername().trim();
        String password = request.getPassword().trim();

        boolean usernameMatches = username.equalsIgnoreCase(configuredUsername.trim()) ||
                username.equalsIgnoreCase("admin@freshcart.com") ||
                username.equalsIgnoreCase("admin");
        boolean passwordMatches = password.equals(configuredPassword.trim()) ||
                password.equals(configuredKey.trim());

        if (!usernameMatches || !passwordMatches) {
            throw new UnauthorizedException("Invalid admin username or password");
        }

        String token = "fc_adm_" + UUID.randomUUID().toString().replace("-", "");
        activeAdminTokens.add(token);

        return new AdminAuthResponseDTO(token, username, "ROLE_ADMIN");
    }

    public boolean isValidAdminToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        String clean = token.trim();
        if (clean.startsWith("Bearer ")) {
            clean = clean.substring(7).trim();
        }
        return activeAdminTokens.contains(clean) || clean.equals(configuredKey.trim()) || clean.equals(configuredPassword.trim());
    }

    public void logout(String token) {
        if (token != null) {
            String clean = token.trim();
            if (clean.startsWith("Bearer ")) {
                clean = clean.substring(7).trim();
            }
            activeAdminTokens.remove(clean);
        }
    }
}
