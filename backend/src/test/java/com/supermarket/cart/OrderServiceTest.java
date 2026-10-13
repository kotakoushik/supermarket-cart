package com.supermarket.cart;

import com.supermarket.cart.dto.CheckoutRequestDTO;
import com.supermarket.cart.dto.OrderResponseDTO;
import com.supermarket.cart.entity.CartItem;
import com.supermarket.cart.entity.Order;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.exception.BadRequestException;
import com.supermarket.cart.exception.InsufficientStockException;
import com.supermarket.cart.repository.CartItemRepository;
import com.supermarket.cart.repository.OrderRepository;
import com.supermarket.cart.repository.ProductRepository;
import com.supermarket.cart.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @InjectMocks
    private OrderService orderService;

    private Product testProduct;
    private CartItem testCartItem;

    @BeforeEach
    void setUp() {
        testProduct = new Product(1L, "Basmati Rice 5kg", "Rice", "Grains and Pulses", new BigDecimal("500.00"), 10, "img.jpg", true);
        testCartItem = new CartItem("cart-xyz", testProduct, 2);
    }

    @Test
    void testCheckoutSuccessDeductsStockAndClearsCart() {
        CheckoutRequestDTO checkoutReq = new CheckoutRequestDTO("cart-xyz", "Koushik", "koushik@example.com", "9876543210", "123 Main Street");

        when(cartItemRepository.findByCartId("cart-xyz")).thenReturn(List.of(testCartItem));
        when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testProduct));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(101L);
            return o;
        });

        OrderResponseDTO orderResponse = orderService.createOrder(checkoutReq);

        assertNotNull(orderResponse);
        assertEquals(101L, orderResponse.getId());
        assertEquals("Koushik", orderResponse.getCustomerName());
        assertEquals(new BigDecimal("1000.00"), orderResponse.getTotalAmount());

        // Verify stock was reduced from 10 to 8
        assertEquals(8, testProduct.getStockQuantity());
        verify(productRepository, times(1)).save(testProduct);

        // Verify cart was cleared
        verify(cartItemRepository, times(1)).deleteByCartId("cart-xyz");
    }

    @Test
    void testCheckoutEmptyCartFails() {
        CheckoutRequestDTO checkoutReq = new CheckoutRequestDTO("cart-empty", "Koushik", "koushik@example.com", "9876543210", "123 Main Street");
        when(cartItemRepository.findByCartId("cart-empty")).thenReturn(Collections.emptyList());

        assertThrows(BadRequestException.class, () -> orderService.createOrder(checkoutReq));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void testCheckoutInsufficientStockThrowsException() {
        CheckoutRequestDTO checkoutReq = new CheckoutRequestDTO("cart-xyz", "Koushik", "koushik@example.com", "9876543210", "123 Main Street");

        // Product has only 1 in stock, but cart requests 2
        testProduct.setStockQuantity(1);
        when(cartItemRepository.findByCartId("cart-xyz")).thenReturn(List.of(testCartItem));
        when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testProduct));

        assertThrows(InsufficientStockException.class, () -> orderService.createOrder(checkoutReq));
        verify(orderRepository, never()).save(any(Order.class));
    }
}
