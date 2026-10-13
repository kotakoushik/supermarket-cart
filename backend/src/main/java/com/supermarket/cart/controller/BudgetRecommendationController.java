package com.supermarket.cart.controller;

import com.supermarket.cart.dto.BudgetCheckRequestDTO;
import com.supermarket.cart.dto.BudgetCheckResponseDTO;
import com.supermarket.cart.dto.ProductDTO;
import com.supermarket.cart.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BudgetRecommendationController {

    private final RecommendationService recommendationService;

    public BudgetRecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/budget/check")
    public ResponseEntity<BudgetCheckResponseDTO> checkBudget(
            @RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
            @Valid @RequestBody BudgetCheckRequestDTO request) {
        if (request.getCartId() == null || request.getCartId().isBlank()) {
            request.setCartId(headerCartId != null ? headerCartId : "default-session");
        }
        return ResponseEntity.ok(recommendationService.checkBudget(request));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<ProductDTO>> getRecommendations(
            @RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
            @RequestParam(value = "cartId", required = false) String paramCartId) {
        String cartId = headerCartId != null ? headerCartId : (paramCartId != null ? paramCartId : "default-session");
        return ResponseEntity.ok(recommendationService.getRecommendations(cartId));
    }
}
