package com.supermarket.cart.controller;

import com.supermarket.cart.dto.CartItemRequestDTO;
import com.supermarket.cart.dto.CartResponseDTO;
import com.supermarket.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    private String resolveCartId(String headerCartId, String headerSessionKey, String paramCartId) {
        if (headerCartId != null && !headerCartId.isBlank()) {
            return headerCartId;
        }
        if (headerSessionKey != null && !headerSessionKey.isBlank()) {
            return headerSessionKey;
        }
        if (paramCartId != null && !paramCartId.isBlank()) {
            return paramCartId;
        }
        return "default-session";
    }

    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(
            @RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
            @RequestHeader(value = "X-Session-Key", required = false) String headerSessionKey,
            @RequestParam(value = "cartId", required = false) String paramCartId) {
        String cartId = resolveCartId(headerCartId, headerSessionKey, paramCartId);
        return ResponseEntity.ok(cartService.getCart(cartId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponseDTO> addItem(
            @RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
            @RequestHeader(value = "X-Session-Key", required = false) String headerSessionKey,
            @RequestParam(value = "cartId", required = false) String paramCartId,
            @Valid @RequestBody CartItemRequestDTO request) {
        String cartId = resolveCartId(headerCartId, headerSessionKey, paramCartId);
        return ResponseEntity.ok(cartService.addItemToCart(cartId, request));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponseDTO> updateItemQuantity(
            @RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
            @RequestHeader(value = "X-Session-Key", required = false) String headerSessionKey,
            @RequestParam(value = "cartId", required = false) String paramCartId,
            @PathVariable Long productId,
            @RequestBody Map<String, Integer> payload) {
        String cartId = resolveCartId(headerCartId, headerSessionKey, paramCartId);
        Integer quantity = payload.get("quantity");
        if (quantity == null) {
            quantity = 1;
        }
        return ResponseEntity.ok(cartService.updateItemQuantity(cartId, productId, quantity));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponseDTO> removeItem(
            @RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
            @RequestHeader(value = "X-Session-Key", required = false) String headerSessionKey,
            @RequestParam(value = "cartId", required = false) String paramCartId,
            @PathVariable Long productId) {
        String cartId = resolveCartId(headerCartId, headerSessionKey, paramCartId);
        return ResponseEntity.ok(cartService.removeItemFromCart(cartId, productId));
    }

    @DeleteMapping
    public ResponseEntity<CartResponseDTO> clearCart(
            @RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
            @RequestHeader(value = "X-Session-Key", required = false) String headerSessionKey,
            @RequestParam(value = "cartId", required = false) String paramCartId) {
        String cartId = resolveCartId(headerCartId, headerSessionKey, paramCartId);
        return ResponseEntity.ok(cartService.clearCart(cartId));
    }
}
