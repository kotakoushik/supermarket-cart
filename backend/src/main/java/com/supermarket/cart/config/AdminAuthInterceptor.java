package com.supermarket.cart.config;

import com.supermarket.cart.exception.UnauthorizedException;
import com.supermarket.cart.service.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    private final AdminAuthService adminAuthService;

    public AdminAuthInterceptor(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Allow CORS pre-flight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Allow public admin auth endpoints
        String path = request.getRequestURI();
        if (path != null && path.startsWith("/api/admin/auth/")) {
            return true;
        }

        String providedKey = request.getHeader("X-Admin-Key");
        if (providedKey == null || providedKey.isBlank()) {
            // Check Authorization header fallback: "Bearer <token>"
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                providedKey = authHeader.substring(7).trim();
            }
        }

        if (providedKey == null || !adminAuthService.isValidAdminToken(providedKey)) {
            throw new UnauthorizedException("Admin authorization token is missing or invalid. Please log in to admin portal.");
        }

        return true;
    }
}
