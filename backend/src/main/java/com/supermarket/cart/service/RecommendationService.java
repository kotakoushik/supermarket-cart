package com.supermarket.cart.service;

import com.supermarket.cart.dto.AlternativeProductDTO;
import com.supermarket.cart.dto.BudgetCheckRequestDTO;
import com.supermarket.cart.dto.BudgetCheckResponseDTO;
import com.supermarket.cart.dto.CartResponseDTO;
import com.supermarket.cart.dto.ProductDTO;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.exception.BadRequestException;
import com.supermarket.cart.exception.ResourceNotFoundException;
import com.supermarket.cart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Explainable, rule-based recommendation engine for smart grocery shopping.
 * Provides budget-aware alternatives and complementary product pairings.
 */
@Service
public class RecommendationService {

    private final ProductRepository productRepository;
    private final CartService cartService;
    private final ProductService productService;

    // Complementary category knowledge rules
    private static final Map<String, List<String>> COMPLEMENTARY_CATEGORIES = new HashMap<>();

    static {
        COMPLEMENTARY_CATEGORIES.put("Dairy", List.of("Bakery", "Breakfast"));
        COMPLEMENTARY_CATEGORIES.put("Bakery", List.of("Dairy", "Beverages", "Breakfast"));
        COMPLEMENTARY_CATEGORIES.put("Breakfast", List.of("Dairy", "Beverages"));
        COMPLEMENTARY_CATEGORIES.put("Grains and Pulses", List.of("Cooking Essentials", "Fruits and Vegetables"));
        COMPLEMENTARY_CATEGORIES.put("Fruits and Vegetables", List.of("Grains and Pulses", "Snacks"));
        COMPLEMENTARY_CATEGORIES.put("Snacks", List.of("Beverages"));
        COMPLEMENTARY_CATEGORIES.put("Beverages", List.of("Snacks", "Bakery"));
        COMPLEMENTARY_CATEGORIES.put("Cooking Essentials", List.of("Grains and Pulses", "Fruits and Vegetables"));
        COMPLEMENTARY_CATEGORIES.put("Household Products", List.of("Cooking Essentials"));
    }

    public RecommendationService(ProductRepository productRepository, CartService cartService, ProductService productService) {
        this.productRepository = productRepository;
        this.cartService = cartService;
        this.productService = productService;
    }

    /**
     * Finds cheaper alternatives in the same category for a specific product.
     * Explains the savings and price difference.
     */
    @Transactional(readOnly = true)
    public List<AlternativeProductDTO> getCheaperAlternatives(Long productId) {
        Product original = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        List<Product> cheaperProducts = productRepository.findCheaperAlternatives(
                original.getCategory(), original.getId(), original.getPrice()
        );

        // Intelligently rank candidates: prioritize matching product type/keywords (e.g. Butter -> Butter, Rice -> Rice, Milk -> Milk)
        String[] origWords = original.getName().toLowerCase().split("\\s+");
        return cheaperProducts.stream()
                .filter(p -> p.getStockQuantity() > 0)
                .sorted((a, b) -> {
                    long aMatches = Arrays.stream(origWords).filter(w -> w.length() >= 3 && a.getName().toLowerCase().contains(w)).count();
                    long bMatches = Arrays.stream(origWords).filter(w -> w.length() >= 3 && b.getName().toLowerCase().contains(w)).count();
                    if (aMatches != bMatches) {
                        return Long.compare(bMatches, aMatches); // Higher similarity first
                    }
                    // If same relevance, prefer closest substitute (highest price under original)
                    return b.getPrice().compareTo(a.getPrice());
                })
                .map(alt -> createAlternativeDTO(original, alt))
                .collect(Collectors.toList());
    }

    /**
     * Checks budget against cart, identifies over-budget status, and generates smart alternatives
     * for highest-cost items in the cart to help the shopper bring costs back under budget.
     */
    @Transactional(readOnly = true)
    public BudgetCheckResponseDTO checkBudget(BudgetCheckRequestDTO request) {
        if (request.getBudget() == null || request.getBudget().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Budget must be greater than zero");
        }

        CartResponseDTO cart = cartService.getCart(request.getCartId());
        BigDecimal total = cart.getTotalAmount();
        BigDecimal budget = request.getBudget();

        boolean isOver = total.compareTo(budget) > 0;
        BigDecimal diff = total.subtract(budget);
        
        double utilization = budget.compareTo(BigDecimal.ZERO) > 0 
                ? total.divide(budget, 4, RoundingMode.HALF_UP).doubleValue() * 100.0 
                : 100.0;

        String statusMessage;
        List<AlternativeProductDTO> suggestedAlternatives = new ArrayList<>();

        if (isOver) {
            statusMessage = String.format("Alert: Your cart total (₹%.2f) exceeds your budget (₹%.2f) by ₹%.2f. Here are cheaper alternatives in your selected categories to help save money.",
                    total, budget, diff);

            // Suggest alternatives for items in cart, prioritizing most expensive items
            cart.getItems().stream()
                    .sorted((a, b) -> b.getSubtotal().compareTo(a.getSubtotal()))
                    .forEach(cartItem -> {
                        List<AlternativeProductDTO> alts = getCheaperAlternatives(cartItem.getProductId());
                        if (!alts.isEmpty()) {
                            suggestedAlternatives.add(alts.get(0));
                        }
                    });
        } else {
            BigDecimal remaining = budget.subtract(total);
            statusMessage = String.format("Great shopping! You are within budget (₹%.2f remaining).", remaining);
        }

        return new BudgetCheckResponseDTO(
                budget,
                total,
                isOver,
                diff,
                Math.round(utilization * 100.0) / 100.0,
                statusMessage,
                suggestedAlternatives
        );
    }

    /**
     * Recommends complementary products based on items in the cart or general popular items.
     */
    @Transactional(readOnly = true)
    public List<ProductDTO> getRecommendations(String cartId) {
        List<Long> excludedIds = new ArrayList<>();
        Set<String> targetCategories = new LinkedHashSet<>();

        if (cartId != null && !cartId.isBlank()) {
            CartResponseDTO cart = cartService.getCart(cartId);
            for (var item : cart.getItems()) {
                excludedIds.add(item.getProductId());
                List<String> complements = COMPLEMENTARY_CATEGORIES.get(item.getCategory());
                if (complements != null) {
                    targetCategories.addAll(complements);
                }
            }
        }

        if (excludedIds.isEmpty()) {
            excludedIds.add(-1L);
        }

        if (targetCategories.isEmpty()) {
            targetCategories.addAll(List.of("Dairy", "Bakery", "Snacks", "Beverages"));
        }

        List<Product> recommendations = productRepository.findRecommendations(
                new ArrayList<>(targetCategories), excludedIds
        );

        return recommendations.stream()
                .filter(p -> p.getStockQuantity() > 0)
                .limit(6)
                .map(productService::mapToDTO)
                .collect(Collectors.toList());
    }

    private AlternativeProductDTO createAlternativeDTO(Product original, Product alternative) {
        BigDecimal savings = original.getPrice().subtract(alternative.getPrice());
        double pct = savings.divide(original.getPrice(), 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        String reason = String.format("Save ₹%.2f (%.0f%% off) with %s in %s with verified in-stock availability.",
                savings, pct, alternative.getName(), alternative.getCategory());

        return new AlternativeProductDTO(
                original.getId(),
                original.getName(),
                original.getPrice(),
                alternative.getId(),
                alternative.getName(),
                alternative.getPrice(),
                alternative.getCategory(),
                alternative.getStockQuantity(),
                alternative.getImageUrl(),
                savings,
                Math.round(pct * 10.0) / 10.0,
                reason
        );
    }
}
