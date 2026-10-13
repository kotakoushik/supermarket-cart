package com.supermarket.cart.controller;

import com.supermarket.cart.dto.AlternativeProductDTO;
import com.supermarket.cart.dto.ProductDTO;
import com.supermarket.cart.service.ProductService;
import com.supermarket.cart.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final RecommendationService recommendationService;

    public ProductController(ProductService productService, RecommendationService recommendationService) {
        this.productService = productService;
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "name") String sort) {
        return ResponseEntity.ok(productService.getActiveProducts(category, search, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/{id}/alternatives")
    public ResponseEntity<List<AlternativeProductDTO>> getCheaperAlternatives(@PathVariable Long id) {
        return ResponseEntity.ok(recommendationService.getCheaperAlternatives(id));
    }
}
