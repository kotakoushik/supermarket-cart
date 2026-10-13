package com.supermarket.cart.controller;

import com.supermarket.cart.dto.ProductDTO;
import com.supermarket.cart.dto.ProductStatusUpdateDTO;
import com.supermarket.cart.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllAdminProducts());
    }

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO dto) {
        ProductDTO created = productService.createProduct(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProductDTO> updateProductStatus(
            @PathVariable Long id,
            @Valid @RequestBody ProductStatusUpdateDTO statusDto) {
        return ResponseEntity.ok(productService.updateProductStatus(id, statusDto.getActive()));
    }
}
