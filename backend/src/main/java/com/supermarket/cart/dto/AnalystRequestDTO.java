package com.supermarket.cart.dto;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class AnalystRequestDTO {
    private String cartId;
    private BigDecimal budget;
    // Map of productId -> boolean isEssential override from user
    private Map<Long, Boolean> customOverrides = new HashMap<>();

    public AnalystRequestDTO() {
    }

    public AnalystRequestDTO(String cartId, BigDecimal budget) {
        this.cartId = cartId;
        this.budget = budget;
    }

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public Map<Long, Boolean> getCustomOverrides() {
        return customOverrides;
    }

    public void setCustomOverrides(Map<Long, Boolean> customOverrides) {
        this.customOverrides = customOverrides;
    }
}
