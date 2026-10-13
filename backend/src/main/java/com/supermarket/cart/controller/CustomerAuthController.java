package com.supermarket.cart.controller;

import com.supermarket.cart.dto.AuthResponseDTO;
import com.supermarket.cart.dto.CustomerResponseDTO;
import com.supermarket.cart.dto.LoginRequestDTO;
import com.supermarket.cart.dto.RegisterRequestDTO;
import com.supermarket.cart.entity.Customer;
import com.supermarket.cart.service.CustomerAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class CustomerAuthController {

    private final CustomerAuthService authService;

    public CustomerAuthController(CustomerAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<CustomerResponseDTO> getCurrentCustomer(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Customer-Token", required = false) String tokenHeader) {
        String token = tokenHeader != null && !tokenHeader.isBlank() ? tokenHeader : authHeader;
        Customer customer = authService.requireAuthenticatedCustomer(token);
        return ResponseEntity.ok(authService.mapToDTO(customer));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Customer-Token", required = false) String tokenHeader) {
        String token = tokenHeader != null && !tokenHeader.isBlank() ? tokenHeader : authHeader;
        authService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
