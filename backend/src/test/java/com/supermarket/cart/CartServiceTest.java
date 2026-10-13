package com.supermarket.cart;

import com.supermarket.cart.dto.CartItemRequestDTO;
import com.supermarket.cart.dto.CartResponseDTO;
import com.supermarket.cart.entity.CartItem;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.exception.BadRequestException;
import com.supermarket.cart.exception.InsufficientStockException;
import com.supermarket.cart.repository.CartItemRepository;
import com.supermarket.cart.repository.ProductRepository;
import com.supermarket.cart.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product(1L, "Corn Flakes", "Crispy", "Breakfast", new BigDecimal("150.00"), 10, "img.jpg", true);
    }

    @Test
    void testAddItemToCartSuccess() {
        String cartId = "cart-123";
        CartItemRequestDTO request = new CartItemRequestDTO(1L, 2);

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(cartItemRepository.findByCartIdAndProductId(cartId, 1L)).thenReturn(Optional.empty());

        CartItem savedItem = new CartItem(cartId, testProduct, 2);
        when(cartItemRepository.findByCartId(cartId)).thenReturn(List.of(savedItem));

        CartResponseDTO response = cartService.addItemToCart(cartId, request);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals(2, response.getTotalItems());
        // 2 * 150 = 300
        assertEquals(new BigDecimal("300.00"), response.getTotalAmount());
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    void testAddItemExceedingStockThrowsException() {
        String cartId = "cart-123";
        // product has stock 10, requesting 15
        CartItemRequestDTO request = new CartItemRequestDTO(1L, 15);

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(cartItemRepository.findByCartIdAndProductId(cartId, 1L)).thenReturn(Optional.empty());

        assertThrows(InsufficientStockException.class, () -> cartService.addItemToCart(cartId, request));
    }

    @Test
    void testAddInactiveProductThrowsException() {
        testProduct.setActive(false);
        String cartId = "cart-123";
        CartItemRequestDTO request = new CartItemRequestDTO(1L, 1);

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        assertThrows(BadRequestException.class, () -> cartService.addItemToCart(cartId, request));
    }

    @Test
    void testClearCart() {
        String cartId = "cart-123";

        CartResponseDTO response = cartService.clearCart(cartId);

        assertNotNull(response);
        assertEquals(0, response.getItems().size());
        assertEquals(0, response.getTotalItems());
        assertEquals(BigDecimal.ZERO, response.getTotalAmount());
        verify(cartItemRepository, times(1)).deleteByCartId(cartId);
    }
}
