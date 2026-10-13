package com.supermarket.cart;

import com.supermarket.cart.dto.*;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.repository.ProductRepository;
import com.supermarket.cart.service.CartAnalystService;
import com.supermarket.cart.service.CartService;
import com.supermarket.cart.service.RecommendationService;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CartAnalystServiceTest {

    @Mock
    private CartService cartService;

    @Mock
    private RecommendationService recommendationService;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartAnalystService cartAnalystService;

    private CartItemResponseDTO essentialButter;
    private CartItemResponseDTO optionalChips;
    private AlternativeProductDTO cheaperButterAlt;

    @BeforeEach
    void setUp() {
        essentialButter = new CartItemResponseDTO(1L, 3L, "Amul Pasteurized Butter 500g", "Dairy",
                new BigDecimal("275.00"), 2, new BigDecimal("550.00"), 30, "butter.jpg");

        optionalChips = new CartItemResponseDTO(2L, 17L, "Lay's India's Magic Masala 50g", "Snacks",
                new BigDecimal("20.00"), 3, new BigDecimal("60.00"), 50, "chips.jpg");

        cheaperButterAlt = new AlternativeProductDTO(3L, "Amul Pasteurized Butter 500g", new BigDecimal("275.00"),
                4L, "Nandini Salted Butter 500g", new BigDecimal("250.00"), "Dairy", 25, "nandini.jpg",
                new BigDecimal("25.00"), 9.1, "Save ₹25.00 with Nandini Salted Butter");
    }

    @Test
    void testAnalyzeEmptyCartReturnsHelpfulMessage() {
        when(cartService.getCart("cart-empty")).thenReturn(
                new CartResponseDTO("cart-empty", Collections.emptyList(), 0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO)
        );

        AnalystRequestDTO req = new AnalystRequestDTO("cart-empty", new BigDecimal("500.00"));
        AnalystReportDTO report = cartAnalystService.analyzeCart(req);

        assertNotNull(report);
        assertEquals(BigDecimal.ZERO, report.getCurrentTotal());
        assertTrue(report.getItems().isEmpty());
        assertTrue(report.getSummaryMessage().contains("empty"));
    }

    @Test
    void testAnalyzeCartCategorizesItemsAndCalculatesSavings() {
        String cartId = "cart-analyst-1";
        CartResponseDTO cart = new CartResponseDTO(cartId, List.of(essentialButter, optionalChips),
                5, new BigDecimal("610.00"), BigDecimal.ZERO, new BigDecimal("610.00"));

        when(cartService.getCart(cartId)).thenReturn(cart);
        when(recommendationService.getCheaperAlternatives(3L)).thenReturn(List.of(cheaperButterAlt));
        when(recommendationService.getCheaperAlternatives(17L)).thenReturn(Collections.emptyList());

        AnalystRequestDTO req = new AnalystRequestDTO(cartId, new BigDecimal("500.00"));
        AnalystReportDTO report = cartAnalystService.analyzeCart(req);

        assertNotNull(report);
        assertEquals(new BigDecimal("610.00"), report.getCurrentTotal());
        assertEquals(new BigDecimal("500.00"), report.getBudget());
        assertTrue(report.isOverBudget());

        // Essential: Butter (550.00), Optional: Chips (60.00)
        assertEquals(new BigDecimal("550.00"), report.getEssentialSubtotal());
        assertEquals(new BigDecimal("60.00"), report.getOptionalSubtotal());

        // Check recommended actions
        assertFalse(report.getRecommendedActions().isEmpty());
        boolean hasReplaceAction = report.getRecommendedActions().stream()
                .anyMatch(a -> "REPLACE".equals(a.getActionType()) && a.getReplacementProductId().equals(4L));
        assertTrue(hasReplaceAction);
    }

    @Test
    void testApplySelectedChangesExecutesActions() {
        String cartId = "cart-apply-1";
        CartResponseDTO mockCart = new CartResponseDTO(cartId, List.of(essentialButter, optionalChips),
                5, new BigDecimal("610.00"), BigDecimal.ZERO, new BigDecimal("610.00"));
        when(cartService.getCart(cartId)).thenReturn(mockCart);

        Product nandiniProduct = new Product(4L, "Nandini Salted Butter 500g", "Desc", "Dairy",
                new BigDecimal("250.00"), 20, "nandini.jpg", true);

        when(productRepository.findById(4L)).thenReturn(Optional.of(nandiniProduct));

        AnalystActionDTO replaceAction = new AnalystActionDTO(
                "replace-3-4", 3L, "Amul Butter", "REPLACE", "Switch to Nandini",
                4L, "Nandini Butter", 2, new BigDecimal("50.00"), "Save 50"
        );

        AnalystActionDTO reduceChipsAction = new AnalystActionDTO(
                "reduce-17", 17L, "Lay's Chips", "REDUCE_QUANTITY", "Reduce qty to 1",
                null, null, 1, new BigDecimal("40.00"), "Save 40"
        );

        AnalystApplyRequestDTO applyReq = new AnalystApplyRequestDTO(cartId, List.of(replaceAction, reduceChipsAction));

        cartAnalystService.applySelectedChanges(applyReq);

        // Verify CartService methods were invoked
        verify(cartService, times(1)).removeItemFromCart(cartId, 3L);
        verify(cartService, times(1)).addItemToCart(eq(cartId), any(CartItemRequestDTO.class));
        verify(cartService, times(1)).updateItemQuantity(cartId, 17L, 1);
    }

    @Test
    void testApplySelectedChangesRejectsConflictingActionsOnSameProduct() {
        String cartId = "cart-conflict-1";
        AnalystActionDTO replaceAction = new AnalystActionDTO(
                "replace-3-4", 3L, "Amul Butter", "REPLACE", "Switch to Nandini",
                4L, "Nandini Butter", 2, new BigDecimal("50.00"), "Save 50"
        );
        AnalystActionDTO reduceAction = new AnalystActionDTO(
                "reduce-3", 3L, "Amul Butter", "REDUCE_QUANTITY", "Reduce qty to 1",
                null, null, 1, new BigDecimal("275.00"), "Save 275"
        );

        AnalystApplyRequestDTO applyReq = new AnalystApplyRequestDTO(cartId, List.of(replaceAction, reduceAction));

        Exception ex = assertThrows(com.supermarket.cart.exception.BadRequestException.class, () -> {
            cartAnalystService.applySelectedChanges(applyReq);
        });

        assertTrue(ex.getMessage().contains("Conflicting actions detected"));
    }

    @Test
    void testApplySelectedChangesRejectsInsufficientStockForReplacement() {
        String cartId = "cart-stock-1";
        CartResponseDTO mockCart = new CartResponseDTO(cartId, List.of(essentialButter),
                2, new BigDecimal("550.00"), BigDecimal.ZERO, new BigDecimal("550.00"));
        when(cartService.getCart(cartId)).thenReturn(mockCart);

        Product lowStockProduct = new Product(4L, "Nandini Butter", "Desc", "Dairy",
                new BigDecimal("250.00"), 1, "nandini.jpg", true); // Stock is 1, required is 2
        when(productRepository.findById(4L)).thenReturn(Optional.of(lowStockProduct));

        AnalystActionDTO replaceAction = new AnalystActionDTO(
                "replace-3-4", 3L, "Amul Butter", "REPLACE", "Switch to Nandini",
                4L, "Nandini Butter", 2, new BigDecimal("50.00"), "Save 50"
        );

        AnalystApplyRequestDTO applyReq = new AnalystApplyRequestDTO(cartId, List.of(replaceAction));

        Exception ex = assertThrows(com.supermarket.cart.exception.BadRequestException.class, () -> {
            cartAnalystService.applySelectedChanges(applyReq);
        });

        assertTrue(ex.getMessage().contains("Insufficient stock for replacement product"));
    }

    @Test
    void testApplySelectedChangesRejectsStaleItemNotInCart() {
        String cartId = "cart-stale-1";
        CartResponseDTO emptyCart = new CartResponseDTO(cartId, Collections.emptyList(),
                0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        when(cartService.getCart(cartId)).thenReturn(emptyCart);

        AnalystActionDTO removeAction = new AnalystActionDTO(
                "remove-99", 99L, "Ghost Product", "REMOVE", "Remove",
                null, null, 0, new BigDecimal("100.00"), "Save 100"
        );

        AnalystApplyRequestDTO applyReq = new AnalystApplyRequestDTO(cartId, List.of(removeAction));

        Exception ex = assertThrows(com.supermarket.cart.exception.BadRequestException.class, () -> {
            cartAnalystService.applySelectedChanges(applyReq);
        });

        assertTrue(ex.getMessage().contains("Stale analysis"));
    }
}
