package com.supermarket.cart.service;

import com.supermarket.cart.dto.AuthResponseDTO;
import com.supermarket.cart.dto.CustomerResponseDTO;
import com.supermarket.cart.dto.LoginRequestDTO;
import com.supermarket.cart.dto.RegisterRequestDTO;
import com.supermarket.cart.entity.Customer;
import com.supermarket.cart.exception.BadRequestException;
import com.supermarket.cart.exception.UnauthorizedException;
import com.supermarket.cart.repository.CustomerRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // In-memory token store mapping token -> customerId
    private final Map<String, Long> tokenStore = new ConcurrentHashMap<>();

    public CustomerAuthService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        if (customerRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("An account with email " + email + " already exists. Please log in.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        Customer customer = new Customer(
                request.getFullName().trim(),
                email,
                hashedPassword,
                request.getPhone() != null ? request.getPhone().trim() : null,
                request.getAddress() != null ? request.getAddress().trim() : null
        );

        Customer saved = customerRepository.save(customer);
        String token = generateToken(saved.getId());

        return new AuthResponseDTO(token, mapToDTO(saved));
    }

    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            throw new BadRequestException("Please enter both email and password.");
        }
        String email = request.getEmail().trim().toLowerCase();
        Customer customer = customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = generateToken(customer.getId());
        return new AuthResponseDTO(token, mapToDTO(customer));
    }

    public void logout(String token) {
        if (token != null) {
            String cleanToken = cleanToken(token);
            tokenStore.remove(cleanToken);
        }
    }

    @Transactional(readOnly = true)
    public Customer getAuthenticatedCustomer(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }

        String cleanToken = cleanToken(authHeader);
        Long customerId = tokenStore.get(cleanToken);
        if (customerId == null) {
            return null;
        }

        return customerRepository.findById(customerId).orElse(null);
    }

    @Transactional(readOnly = true)
    public Customer requireAuthenticatedCustomer(String authHeader) {
        Customer customer = getAuthenticatedCustomer(authHeader);
        if (customer == null) {
            throw new UnauthorizedException("Please log in to your customer account to continue.");
        }
        return customer;
    }

    private String generateToken(Long customerId) {
        String token = "fc_cust_" + UUID.randomUUID().toString().replace("-", "");
        tokenStore.put(token, customerId);
        return token;
    }

    private String cleanToken(String raw) {
        String token = raw.trim();
        if (token.regionMatches(true, 0, "Bearer ", 0, 7)) {
            token = token.substring(7).trim();
        }
        return token;
    }

    public CustomerResponseDTO mapToDTO(Customer customer) {
        return new CustomerResponseDTO(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getCreatedAt()
        );
    }
}
