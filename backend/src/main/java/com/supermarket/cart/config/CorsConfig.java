package com.supermarket.cart.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.*;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:https://smartsmart-frontend.onrender.com,http://localhost:5173,http://localhost:3000,http://localhost:80,http://localhost}")
    private String allowedOrigins;

    private static final List<String> DEFAULT_EXACT_ORIGINS = List.of(
            "https://smartsmart-frontend.onrender.com",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:80",
            "http://localhost:8080",
            "http://localhost:8081",
            "http://localhost",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:80",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:8081",
            "http://127.0.0.1"
    );

    private static final List<String> ALLOWED_METHODS = List.of(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"
    );

    private static final List<String> ALLOWED_HEADERS = List.of(
            "Content-Type",
            "X-Cart-Id",
            "X-Session-Key",
            "X-Customer-Token",
            "X-Admin-Key",
            "Authorization",
            "Accept",
            "Origin",
            "X-Requested-With"
    );

    private static final List<String> EXPOSED_HEADERS = List.of(
            "X-Cart-Id",
            "X-Session-Key",
            "X-Customer-Token",
            "X-Admin-Key"
    );

    private Set<String> resolveExactOrigins() {
        Set<String> set = new LinkedHashSet<>(DEFAULT_EXACT_ORIGINS);
        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            for (String origin : allowedOrigins.split(",")) {
                String trimmed = origin.trim();
                // Strictly exclude wildcard origins when credentials are enabled
                if (!trimmed.isEmpty() && !trimmed.equals("*") && !trimmed.contains("*")) {
                    set.add(trimmed);
                }
            }
        }
        return set;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = resolveExactOrigins().toArray(new String[0]);
        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods(ALLOWED_METHODS.toArray(new String[0]))
                .allowedHeaders(ALLOWED_HEADERS.toArray(new String[0]))
                .exposedHeaders(EXPOSED_HEADERS.toArray(new String[0]))
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Exact origins only — no wildcard pattern with credentials
        for (String origin : resolveExactOrigins()) {
            config.addAllowedOrigin(origin);
        }

        config.setAllowCredentials(true);
        config.setAllowedMethods(ALLOWED_METHODS);
        config.setAllowedHeaders(ALLOWED_HEADERS);
        config.setExposedHeaders(EXPOSED_HEADERS);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
