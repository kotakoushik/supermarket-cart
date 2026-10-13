package com.supermarket.cart.controller;

import com.supermarket.cart.dto.CheckoutRequestDTO;
import com.supermarket.cart.dto.OrderResponseDTO;
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

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(
            @RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
            @Valid @RequestBody CheckoutRequestDTO request) {
        if (request.getCartId() == null || request.getCartId().isBlank()) {
            request.setCartId(headerCartId != null ? headerCartId : "default-session");
        }
        OrderResponseDTO order = orderService.createOrder(request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}
