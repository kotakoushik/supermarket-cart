package com.supermarket.cart.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173}")
    private String allowedOrigins;

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
        // Allow pattern for any local dev or Vercel/Netlify preview deployments
        config.addAllowedOriginPattern("http://localhost:*");
        config.addAllowedOriginPattern("https://*.vercel.app");
        config.addAllowedOriginPattern("https://*.netlify.app");

        config.setAllowCredentials(true);
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.addExposedHeader("X-Cart-Id");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
