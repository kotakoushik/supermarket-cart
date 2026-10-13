package com.supermarket.cart;

import com.supermarket.cart.dto.AlternativeProductDTO;
import com.supermarket.cart.dto.BudgetCheckRequestDTO;
import com.supermarket.cart.dto.BudgetCheckResponseDTO;
import com.supermarket.cart.dto.CartItemResponseDTO;
import com.supermarket.cart.dto.CartResponseDTO;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.repository.ProductRepository;
import com.supermarket.cart.service.CartService;
import com.supermarket.cart.service.ProductService;
import com.supermarket.cart.service.RecommendationService;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecommendationServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartService cartService;

    @Mock
    private ProductService productService;

    @InjectMocks
    private RecommendationService recommendationService;

    private Product premiumButter;
    private Product cheaperButter;

    @BeforeEach
    void setUp() {
        premiumButter = new Product(1L, "Amul Butter 500g", "Delicious", "Dairy", new BigDecimal("275.00"), 20, "img1.jpg", true);
        cheaperButter = new Product(2L, "Nandini Butter 500g", "Economical", "Dairy", new BigDecimal("250.00"), 15, "img2.jpg", true);
    }

    @Test
    void testGetCheaperAlternativesReturnsSavings() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(premiumButter));
        when(productRepository.findCheaperAlternatives("Dairy", 1L, new BigDecimal("275.00")))
                .thenReturn(List.of(cheaperButter));

        List<AlternativeProductDTO> alternatives = recommendationService.getCheaperAlternatives(1L);

        assertNotNull(alternatives);
        assertEquals(1, alternatives.size());
        AlternativeProductDTO alt = alternatives.get(0);
        assertEquals(2L, alt.getAlternativeProductId());
        assertEquals(new BigDecimal("25.00"), alt.getSavingsAmount());
        assertTrue(alt.getReason().contains("Save ₹25.00"));
    }

    @Test
    void testCheckBudgetOverBudget() {
        String cartId = "cart-budget";
        CartItemResponseDTO item = new CartItemResponseDTO(1L, 1L, "Amul Butter", "Dairy", new BigDecimal("275.00"), 2, new BigDecimal("550.00"), 20, "img.jpg");
        CartResponseDTO cart = new CartResponseDTO(cartId, List.of(item), 2, new BigDecimal("550.00"), BigDecimal.ZERO, new BigDecimal("550.00"));

        when(cartService.getCart(cartId)).thenReturn(cart);
        when(productRepository.findById(1L)).thenReturn(Optional.of(premiumButter));
        when(productRepository.findCheaperAlternatives("Dairy", 1L, new BigDecimal("275.00")))
                .thenReturn(List.of(cheaperButter));

        BudgetCheckRequestDTO req = new BudgetCheckRequestDTO(new BigDecimal("400.00"), cartId);
        BudgetCheckResponseDTO response = recommendationService.checkBudget(req);

        assertNotNull(response);
        assertTrue(response.isOverBudget());
        assertEquals(new BigDecimal("150.00"), response.getDifference());
        assertFalse(response.getSuggestedAlternatives().isEmpty());
    }
}
