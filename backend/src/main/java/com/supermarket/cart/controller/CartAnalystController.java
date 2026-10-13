package com.supermarket.cart.controller;

import com.supermarket.cart.dto.AnalystApplyRequestDTO;
import com.supermarket.cart.dto.AnalystReportDTO;
import com.supermarket.cart.dto.AnalystRequestDTO;
import com.supermarket.cart.dto.CartResponseDTO;
import com.supermarket.cart.service.CartAnalystService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analyst")
public class CartAnalystController {

    private final CartAnalystService cartAnalystService;

    public CartAnalystController(CartAnalystService cartAnalystService) {
        this.cartAnalystService = cartAnalystService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalystReportDTO> analyzeCart(
            @RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
            @RequestHeader(value = "X-Session-Key", required = false) String headerSessionKey,
            @RequestBody(required = false) AnalystRequestDTO request) {
        if (request == null) {
            request = new AnalystRequestDTO();
        }
        if (request.getCartId() == null || request.getCartId().isBlank()) {
            String resolved = headerCartId != null ? headerCartId : (headerSessionKey != null ? headerSessionKey : "default-session");
            request.setCartId(resolved);
        }
        return ResponseEntity.ok(cartAnalystService.analyzeCart(request));
    }

    @PostMapping("/apply")
    public ResponseEntity<CartResponseDTO> applyChanges(
            @RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
            @RequestHeader(value = "X-Session-Key", required = false) String headerSessionKey,
            @RequestBody AnalystApplyRequestDTO request) {
        if (request.getCartId() == null || request.getCartId().isBlank()) {
            String resolved = headerCartId != null ? headerCartId : (headerSessionKey != null ? headerSessionKey : "default-session");
            request.setCartId(resolved);
        }
        return ResponseEntity.ok(cartAnalystService.applySelectedChanges(request));
    }
}
