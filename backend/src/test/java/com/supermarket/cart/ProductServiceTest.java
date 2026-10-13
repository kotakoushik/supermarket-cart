package com.supermarket.cart;

import com.supermarket.cart.dto.ProductDTO;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.exception.BadRequestException;
import com.supermarket.cart.repository.ProductRepository;
import com.supermarket.cart.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product(1L, "Fresh Milk 1L", "Pure milk", "Dairy", new BigDecimal("50.00"), 20, "img.jpg", true);
    }

    @Test
    void testGetActiveProductsWithoutFilter() {
        when(productRepository.findByActiveTrue(any(Sort.class))).thenReturn(List.of(testProduct));

        List<ProductDTO> products = productService.getActiveProducts(null, null, "name");

        assertNotNull(products);
        assertEquals(1, products.size());
        assertEquals("Fresh Milk 1L", products.get(0).getName());
        verify(productRepository, times(1)).findByActiveTrue(any(Sort.class));
    }

    @Test
    void testGetActiveProductsWithFilterAndSearch() {
        when(productRepository.searchProducts(eq("Dairy"), eq("Milk"), any(Sort.class)))
                .thenReturn(List.of(testProduct));

        List<ProductDTO> products = productService.getActiveProducts("Dairy", "Milk", "price_asc");

        assertNotNull(products);
        assertEquals(1, products.size());
        assertEquals("Dairy", products.get(0).getCategory());
    }

    @Test
    void testCreateProductSuccess() {
        ProductDTO newDto = new ProductDTO(null, "Whole Wheat Bread", "Fresh bread", "Bakery", new BigDecimal("40.00"), 15, "bread.jpg", true);
        Product saved = new Product(2L, "Whole Wheat Bread", "Fresh bread", "Bakery", new BigDecimal("40.00"), 15, "bread.jpg", true);

        when(productRepository.save(any(Product.class))).thenReturn(saved);

        ProductDTO result = productService.createProduct(newDto);

        assertNotNull(result);
        assertEquals(2L, result.getId());
        assertEquals("Whole Wheat Bread", result.getName());
    }

    @Test
    void testCreateProductInvalidPrice() {
        ProductDTO invalidDto = new ProductDTO(null, "Free Product", "Desc", "Bakery", new BigDecimal("-10.00"), 15, "img.jpg", true);

        assertThrows(BadRequestException.class, () -> productService.createProduct(invalidDto));
    }

    @Test
    void testCreateProductNegativeStock() {
        ProductDTO invalidDto = new ProductDTO(null, "Negative Stock", "Desc", "Bakery", new BigDecimal("10.00"), -5, "img.jpg", true);

        assertThrows(BadRequestException.class, () -> productService.createProduct(invalidDto));
    }
}
