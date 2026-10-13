package com.supermarket.cart.service;

import com.supermarket.cart.dto.ProductDTO;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.exception.BadRequestException;
import com.supermarket.cart.exception.ResourceNotFoundException;
import com.supermarket.cart.repository.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getActiveProducts(String category, String search, String sortBy) {
        Sort sort = parseSort(sortBy);
        List<Product> products;
        
        if ((category != null && !category.isBlank()) || (search != null && !search.isBlank())) {
            String cat = (category != null && !category.isBlank()) ? category.trim() : null;
            String q = (search != null && !search.isBlank()) ? search.trim() : null;
            products = productRepository.searchProducts(cat, q, sort);
        } else {
            products = productRepository.findByActiveTrue(sort);
        }

        return products.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDTO(product);
    }

    @Transactional(readOnly = true)
    public Product getProductEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getAllAdminProducts() {
        return productRepository.findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        validateProduct(dto);
        Product product = new Product(
                null,
                dto.getName().trim(),
                dto.getDescription(),
                dto.getCategory().trim(),
                dto.getPrice(),
                dto.getStockQuantity(),
                dto.getImageUrl(),
                dto.getActive() != null ? dto.getActive() : true
        );
        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        validateProduct(dto);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setName(dto.getName().trim());
        product.setDescription(dto.getDescription());
        product.setCategory(dto.getCategory().trim());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());
        if (dto.getActive() != null) {
            product.setActive(dto.getActive());
        }

        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    @Transactional
    public ProductDTO updateProductStatus(Long id, boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setActive(active);
        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    private void validateProduct(ProductDTO dto) {
        if (dto.getPrice() == null || dto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Product price must be greater than zero");
        }
        if (dto.getStockQuantity() == null || dto.getStockQuantity() < 0) {
            throw new BadRequestException("Stock quantity cannot be negative");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new BadRequestException("Product name cannot be empty");
        }
        if (dto.getCategory() == null || dto.getCategory().isBlank()) {
            throw new BadRequestException("Product category cannot be empty");
        }
    }

    private Sort parseSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "name");
        }
        switch (sortBy.toLowerCase()) {
            case "price_asc":
            case "price-asc":
            case "low-to-high":
                return Sort.by(Sort.Direction.ASC, "price");
            case "price_desc":
            case "price-desc":
            case "high-to-low":
                return Sort.by(Sort.Direction.DESC, "price");
            case "name_desc":
                return Sort.by(Sort.Direction.DESC, "name");
            default:
                return Sort.by(Sort.Direction.ASC, "name");
        }
    }

    public ProductDTO mapToDTO(Product product) {
        return new ProductDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getImageUrl(),
                product.getActive()
        );
    }
}
