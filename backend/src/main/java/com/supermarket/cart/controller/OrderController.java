package com.supermarket.cart.controller;

import com.supermarket.cart.dto.CheckoutRequestDTO;
import com.supermarket.cart.dto.OrderResponseDTO;
import com.supermarket.cart.entity.Customer;
import com.supermarket.cart.exception.UnauthorizedException;
import com.supermarket.cart.service.AdminAuthService;
import com.supermarket.cart.service.CustomerAuthService;
import com.supermarket.cart.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final CustomerAuthService customerAuthService;
    private final AdminAuthService adminAuthService;

    public OrderController(OrderService orderService, CustomerAuthService customerAuthService, AdminAuthService adminAuthService) {
        this.orderService = orderService;
        this.customerAuthService = customerAuthService;
        this.adminAuthService = adminAuthService;
    }

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(
            @RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
            @RequestHeader(value = "X-Session-Key", required = false) String headerSessionKey,
            @RequestHeader(value = "X-Customer-Token", required = false) String customerToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CheckoutRequestDTO request) {

        if (request.getCartId() == null || request.getCartId().isBlank()) {
            String resolved = headerCartId != null ? headerCartId : (headerSessionKey != null ? headerSessionKey : "default-session");
            request.setCartId(resolved);
        }

        String token = customerToken != null && !customerToken.isBlank() ? customerToken : authHeader;
        Customer customer = customerAuthService.getAuthenticatedCustomer(token);

        OrderResponseDTO order = orderService.createOrder(request, customer);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Customer-Token", required = false) String customerToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey) {

        // Check if caller is admin
        String adminToken = adminKey != null && !adminKey.isBlank() ? adminKey : authHeader;
        if (adminAuthService.isValidAdminToken(adminToken)) {
            return ResponseEntity.ok(orderService.getOrderById(id));
        }

        String token = customerToken != null && !customerToken.isBlank() ? customerToken : authHeader;
        Customer customer = customerAuthService.getAuthenticatedCustomer(token);

        return ResponseEntity.ok(orderService.getOrderByIdAndCustomer(id, customer));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getOrders(
            @RequestHeader(value = "X-Customer-Token", required = false) String customerToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey) {

        // Check if caller is admin
        String adminToken = adminKey != null && !adminKey.isBlank() ? adminKey : authHeader;
        if (adminAuthService.isValidAdminToken(adminToken)) {
            return ResponseEntity.ok(orderService.getAllOrders());
        }

        String token = customerToken != null && !customerToken.isBlank() ? customerToken : authHeader;
        Customer customer = customerAuthService.getAuthenticatedCustomer(token);

        if (customer == null) {
            throw new UnauthorizedException("Authentication required: Please log in to view your orders.");
        }

        return ResponseEntity.ok(orderService.getOrdersForCustomer(customer));
    }
}
