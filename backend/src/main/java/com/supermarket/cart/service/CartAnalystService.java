package com.supermarket.cart.service;

import com.supermarket.cart.dto.*;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.exception.BadRequestException;
import com.supermarket.cart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class CartAnalystService {

    private final CartService cartService;
    private final RecommendationService recommendationService;
    private final ProductRepository productRepository;

    // Rules for everyday staples / essentials
    private static final Set<String> ESSENTIAL_CATEGORIES = Set.of(
            "Dairy",
            "Grains and Pulses",
            "Cooking Essentials",
            "Fruits and Vegetables"
    );

    private static final List<String> ESSENTIAL_KEYWORDS = List.of(
            "milk", "rice", "dal", "salt", "oil", "bread", "oats", "potato", "onion"
    );

    private static final Set<String> OPTIONAL_CATEGORIES = Set.of(
            "Snacks"
    );

    private static final List<String> OPTIONAL_KEYWORDS = List.of(
            "chips", "bhujia", "coffee", "muesli", "flakes", "biscuit", "choc", "cola", "soda"
    );

    public CartAnalystService(CartService cartService, RecommendationService recommendationService, ProductRepository productRepository) {
        this.cartService = cartService;
        this.recommendationService = recommendationService;
        this.productRepository = productRepository;
    }

    /**
     * Performs a deterministic, explainable rule-based budget and essentiality analysis of the cart.
     */
    @Transactional(readOnly = true)
    public AnalystReportDTO analyzeCart(AnalystRequestDTO request) {
        String cartId = request.getCartId() != null && !request.getCartId().isBlank() 
                ? request.getCartId() 
                : "default-session";
        
        BigDecimal budget = request.getBudget() != null && request.getBudget().compareTo(BigDecimal.ZERO) > 0
                ? request.getBudget()
                : new BigDecimal("1000.00");

        CartResponseDTO cart = cartService.getCart(cartId);
        BigDecimal currentTotal = cart.getTotalAmount() != null ? cart.getTotalAmount() : BigDecimal.ZERO;

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return new AnalystReportDTO(
                    cartId,
                    BigDecimal.ZERO,
                    budget,
                    false,
                    BigDecimal.ZERO,
                    0.0,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    0,
                    0,
                    new ArrayList<>(),
                    new ArrayList<>(),
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    true,
                    true,
                    "Your shopping cart is currently empty. Add products to activate the AI Shopping Analyst."
            );
        }

        Map<Long, Boolean> userOverrides = request.getCustomOverrides() != null 
                ? request.getCustomOverrides() 
                : Collections.emptyMap();

        List<AnalystItemDTO> analyzedItems = new ArrayList<>();
        List<AnalystActionDTO> recommendedActions = new ArrayList<>();

        BigDecimal essentialSubtotal = BigDecimal.ZERO;
        BigDecimal optionalSubtotal = BigDecimal.ZERO;
        int essentialCount = 0;
        int optionalCount = 0;

        for (CartItemResponseDTO item : cart.getItems()) {
            boolean isEssential = determineEssentiality(item, userOverrides);
            String classification = isEssential ? "ESSENTIAL" : "OPTIONAL";
            String reason = isEssential 
                    ? "Classified as an everyday pantry staple / cooking necessity." 
                    : "Classified as a discretionary snack or premium convenience treat.";

            if (isEssential) {
                essentialSubtotal = essentialSubtotal.add(item.getSubtotal());
                essentialCount += item.getQuantity();
            } else {
                optionalSubtotal = optionalSubtotal.add(item.getSubtotal());
                optionalCount += item.getQuantity();
            }

            // Check for cheaper alternatives
            List<AlternativeProductDTO> alternatives = recommendationService.getCheaperAlternatives(item.getProductId());
            AlternativeProductDTO bestAlt = alternatives.isEmpty() ? null : alternatives.get(0);

            List<AnalystActionDTO> itemActions = new ArrayList<>();

            // 1. Substitution Action (if cheaper alternative exists)
            if (bestAlt != null) {
                BigDecimal unitDiff = item.getUnitPrice().subtract(bestAlt.getAlternativePrice());
                BigDecimal totalSavings = unitDiff.multiply(BigDecimal.valueOf(item.getQuantity()))
                        .setScale(2, RoundingMode.HALF_UP);

                AnalystActionDTO replaceAction = new AnalystActionDTO(
                        "replace-" + item.getProductId() + "-" + bestAlt.getAlternativeProductId(),
                        item.getProductId(),
                        item.getProductName(),
                        "REPLACE",
                        "Switch to " + bestAlt.getAlternativeProductName(),
                        bestAlt.getAlternativeProductId(),
                        bestAlt.getAlternativeProductName(),
                        item.getQuantity(),
                        totalSavings,
                        String.format("Save ₹%.2f by switching to %s (₹%.2f) without sacrificing category need.",
                                totalSavings, bestAlt.getAlternativeProductName(), bestAlt.getAlternativePrice())
                );
                itemActions.add(replaceAction);
                recommendedActions.add(replaceAction);
            }

            // 2. Quantity Reduction Action (if quantity > 1)
            if (item.getQuantity() > 1) {
                BigDecimal savings = item.getUnitPrice().setScale(2, RoundingMode.HALF_UP);
                AnalystActionDTO reduceAction = new AnalystActionDTO(
                        "reduce-" + item.getProductId(),
                        item.getProductId(),
                        item.getProductName(),
                        "REDUCE_QUANTITY",
                        "Reduce quantity to " + (item.getQuantity() - 1),
                        null,
                        null,
                        item.getQuantity() - 1,
                        savings,
                        String.format("Save ₹%.2f by reducing %s from %d to %d.",
                                savings, item.getProductName(), item.getQuantity(), item.getQuantity() - 1)
                );
                itemActions.add(reduceAction);
                if (!isEssential || currentTotal.compareTo(budget) > 0) {
                    recommendedActions.add(reduceAction);
                }
            }

            // 3. Removal Action (if optional)
            if (!isEssential) {
                AnalystActionDTO removeAction = new AnalystActionDTO(
                        "remove-" + item.getProductId(),
                        item.getProductId(),
                        item.getProductName(),
                        "REMOVE",
                        "Remove optional item",
                        null,
                        null,
                        0,
                        item.getSubtotal(),
                        String.format("Save ₹%.2f by removing optional %s from this shopping trip.",
                                item.getSubtotal(), item.getProductName())
                );
                itemActions.add(removeAction);
                if (currentTotal.compareTo(budget) > 0) {
                    recommendedActions.add(removeAction);
                }
            }

            AnalystItemDTO analyzedItem = new AnalystItemDTO(
                    item.getProductId(),
                    item.getProductName(),
                    item.getCategory(),
                    item.getUnitPrice(),
                    item.getQuantity(),
                    item.getSubtotal(),
                    item.getImageUrl(),
                    isEssential,
                    classification,
                    reason,
                    bestAlt,
                    itemActions
            );
            analyzedItems.add(analyzedItem);
        }

        boolean isOver = currentTotal.compareTo(budget) > 0;
        BigDecimal diff = currentTotal.subtract(budget);
        double utilization = budget.compareTo(BigDecimal.ZERO) > 0
                ? currentTotal.divide(budget, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                : 100.0;

        boolean budgetCoversEssentials = budget.compareTo(essentialSubtotal) >= 0;

        // Calculate potential savings from top recommended actions (preventing double counting on same item)
        Set<Long> processedProducts = new HashSet<>();
        BigDecimal totalPotentialSavings = BigDecimal.ZERO;

        for (AnalystActionDTO action : recommendedActions) {
            if (!processedProducts.contains(action.getProductId())) {
                totalPotentialSavings = totalPotentialSavings.add(action.getEstimatedSavings());
                processedProducts.add(action.getProductId());
            }
        }

        BigDecimal projectedTotal = currentTotal.subtract(totalPotentialSavings);
        if (projectedTotal.compareTo(BigDecimal.ZERO) < 0) {
            projectedTotal = BigDecimal.ZERO;
        }
        boolean fitsBudget = projectedTotal.compareTo(budget) <= 0;

        // Formulate friendly, explainable summary
        String summaryMessage;
        if (!isOver) {
            summaryMessage = String.format("Healthy Cart! Your total (₹%.2f) is within your budget of ₹%.2f with ₹%.2f remaining. You can save an additional ₹%.2f through smart alternatives.",
                    currentTotal, budget, budget.subtract(currentTotal), totalPotentialSavings);
        } else if (!budgetCoversEssentials) {
            summaryMessage = String.format("Attention: Your essential groceries alone total ₹%.2f, exceeding your target budget of ₹%.2f. Consider increasing your budget slightly or reducing staple quantities.",
                    essentialSubtotal, budget);
        } else if (fitsBudget) {
            summaryMessage = String.format("Budget Balanced! Applying our top %d smart suggestions will save ₹%.2f, lowering your cart from ₹%.2f to ₹%.2f (comfortably within your ₹%.2f budget) while keeping all core essentials.",
                    processedProducts.size(), totalPotentialSavings, currentTotal, projectedTotal, budget);
        } else {
            summaryMessage = String.format("Cart Over Budget: Your cart exceeds budget by ₹%.2f. Suggested changes will save ₹%.2f, significantly reducing the gap.",
                    diff, totalPotentialSavings);
        }

        return new AnalystReportDTO(
                cartId,
                currentTotal,
                budget,
                isOver,
                diff,
                Math.round(utilization * 100.0) / 100.0,
                essentialSubtotal,
                optionalSubtotal,
                essentialCount,
                optionalCount,
                analyzedItems,
                recommendedActions,
                totalPotentialSavings,
                projectedTotal,
                fitsBudget,
                budgetCoversEssentials,
                summaryMessage
        );
    }

    /**
     * Applies a batch of confirmed analyst changes to the user's cart in a single transaction.
     */
    @Transactional
    public CartResponseDTO applySelectedChanges(AnalystApplyRequestDTO request) {
        if (request.getCartId() == null || request.getCartId().isBlank()) {
            throw new BadRequestException("Cart ID is required to apply changes");
        }

        if (request.getSelectedActions() == null || request.getSelectedActions().isEmpty()) {
            return cartService.getCart(request.getCartId());
        }

        // 1. Prevent conflicting actions targeting the same product
        Set<Long> targetedProductIds = new HashSet<>();
        for (AnalystActionDTO action : request.getSelectedActions()) {
            if (action.getProductId() == null) {
                throw new BadRequestException("Invalid action: target product ID is null");
            }
            if (!targetedProductIds.add(action.getProductId())) {
                throw new BadRequestException("Conflicting actions detected for product ID: " + action.getProductId() + 
                        ". Only one optimization action may be applied per item.");
            }
        }

        // 2. Validate against live cart state to prevent stale analysis bypass
        CartResponseDTO currentCart = cartService.getCart(request.getCartId());
        Map<Long, CartItemResponseDTO> cartItemsMap = new HashMap<>();
        if (currentCart.getItems() != null) {
            for (CartItemResponseDTO item : currentCart.getItems()) {
                cartItemsMap.put(item.getProductId(), item);
            }
        }

        for (AnalystActionDTO action : request.getSelectedActions()) {
            CartItemResponseDTO cartItem = cartItemsMap.get(action.getProductId());
            if (cartItem == null) {
                throw new BadRequestException("Stale analysis: Item '" + action.getProductName() + "' is no longer in your cart.");
            }

            if ("REPLACE".equalsIgnoreCase(action.getActionType())) {
                if (action.getReplacementProductId() == null) {
                    throw new BadRequestException("Replacement product ID must not be null for REPLACE action");
                }

                Product replacement = productRepository.findById(action.getReplacementProductId())
                        .orElseThrow(() -> new BadRequestException("Replacement product not found: " + action.getReplacementProductId()));

                if (!Boolean.TRUE.equals(replacement.getActive())) {
                    throw new BadRequestException("Replacement product '" + replacement.getName() + "' is currently unavailable.");
                }

                int targetQty = action.getTargetQuantity() != null && action.getTargetQuantity() > 0 
                        ? action.getTargetQuantity() 
                        : cartItem.getQuantity();

                if (targetQty > replacement.getStockQuantity()) {
                    throw new BadRequestException("Insufficient stock for replacement product '" + replacement.getName() + 
                            "'. Available: " + replacement.getStockQuantity() + ", Required: " + targetQty);
                }

                // Remove original product from cart
                cartService.removeItemFromCart(request.getCartId(), action.getProductId());

                // Add replacement product to cart
                cartService.addItemToCart(request.getCartId(), new CartItemRequestDTO(replacement.getId(), targetQty));

            } else if ("REDUCE_QUANTITY".equalsIgnoreCase(action.getActionType())) {
                int newQty = action.getTargetQuantity() != null ? action.getTargetQuantity() : 1;
                if (newQty <= 0) {
                    throw new BadRequestException("Target quantity must be greater than 0 for REDUCE_QUANTITY action");
                }
                if (newQty >= cartItem.getQuantity()) {
                    throw new BadRequestException("Target quantity (" + newQty + ") must be less than current cart quantity (" + cartItem.getQuantity() + ")");
                }
                cartService.updateItemQuantity(request.getCartId(), action.getProductId(), newQty);

            } else if ("REMOVE".equalsIgnoreCase(action.getActionType())) {
                cartService.removeItemFromCart(request.getCartId(), action.getProductId());
            } else {
                throw new BadRequestException("Unsupported action type: " + action.getActionType());
            }
        }

        return cartService.getCart(request.getCartId());
    }

    private boolean determineEssentiality(CartItemResponseDTO item, Map<Long, Boolean> userOverrides) {
        // Priority 1: User manual override
        if (userOverrides.containsKey(item.getProductId())) {
            return userOverrides.get(item.getProductId());
        }

        // Priority 2: Explicit optional category
        if (OPTIONAL_CATEGORIES.contains(item.getCategory())) {
            return false;
        }

        String lowerName = item.getProductName().toLowerCase();

        // Priority 3: Check optional keywords (e.g. packaged chips, instant coffee)
        for (String kw : OPTIONAL_KEYWORDS) {
            if (lowerName.contains(kw)) {
                return false;
            }
        }

        // Priority 4: Explicit essential category (Dairy, Grains, Cooking Essentials, Fresh Veg)
        if (ESSENTIAL_CATEGORIES.contains(item.getCategory())) {
            return true;
        }

        // Priority 5: Essential staple keywords
        for (String kw : ESSENTIAL_KEYWORDS) {
            if (lowerName.contains(kw)) {
                return true;
            }
        }

        // Default: general grocery items default to essential
        return true;
    }
}
