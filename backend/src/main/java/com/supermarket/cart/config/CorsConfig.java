package com.supermarket.cart.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost",
                        "http://localhost:80",
                        "http://localhost:8080",
                        "http://localhost:8081",
                        "http://localhost:5173",
                        "http://localhost:3000",
                        "http://127.0.0.1",
                        "http://127.0.0.1:80",
                        "http://127.0.0.1:8080",
                        "http://127.0.0.1:8081",
                        "http://127.0.0.1:5173",
                        "https://smartsmart-frontend.onrender.com"
                )
                .allowedOriginPatterns("http://localhost*", "http://127.0.0.1*", "https://*.vercel.app", "https://*.netlify.app", "https://*.onrender.com")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .exposedHeaders("X-Cart-Id", "X-Session-Key", "X-Customer-Token")
                .allowCredentials(true);
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        for (String origin : origins) {
            String trimmed = origin.trim();
            if (trimmed.equals("*")) {
                config.addAllowedOriginPattern("*");
            } else {
                config.addAllowedOrigin(trimmed);
            }
        }
        config.addAllowedOrigin("http://localhost");
        config.addAllowedOrigin("http://localhost:80");
        config.addAllowedOrigin("http://localhost:8080");
        config.addAllowedOrigin("http://localhost:8081");
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://127.0.0.1");
        config.addAllowedOrigin("http://127.0.0.1:80");
        config.addAllowedOrigin("http://127.0.0.1:8080");
        config.addAllowedOrigin("http://127.0.0.1:8081");
        config.addAllowedOrigin("http://127.0.0.1:5173");
        config.addAllowedOrigin("https://smartsmart-frontend.onrender.com");
        config.addAllowedOriginPattern("http://localhost*");
        config.addAllowedOriginPattern("http://127.0.0.1*");
        config.addAllowedOriginPattern("https://*.vercel.app");
        config.addAllowedOriginPattern("https://*.netlify.app");
        config.addAllowedOriginPattern("https://*.onrender.com");

        config.setAllowCredentials(true);
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        config.addAllowedHeader("*");
        config.addExposedHeader("X-Cart-Id");
        config.addExposedHeader("X-Session-Key");
        config.addExposedHeader("X-Customer-Token");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
