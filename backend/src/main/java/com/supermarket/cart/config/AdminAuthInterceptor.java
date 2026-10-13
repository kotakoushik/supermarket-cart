package com.supermarket.cart.config;

import com.supermarket.cart.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    @Value("${freshcart.admin.key:fc-admin-key-2025}")
    private String adminKey;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Allow CORS pre-flight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String providedKey = request.getHeader("X-Admin-Key");
        if (providedKey == null || providedKey.isBlank()) {
            // Check Authorization header fallback: "Bearer <key>"
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                providedKey = authHeader.substring(7).trim();
            }
        }

        if (providedKey == null || !providedKey.trim().equals(adminKey.trim())) {
            throw new UnauthorizedException("Admin authorization key is missing or invalid. Please provide a valid 'X-Admin-Key' header.");
        }

        return true;
    }

    public String getAdminKey() {
        return adminKey;
    }

    public void setAdminKey(String adminKey) {
        this.adminKey = adminKey;
    }
}
