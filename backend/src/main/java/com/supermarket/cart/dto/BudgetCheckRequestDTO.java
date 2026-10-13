package com.supermarket.cart.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class BudgetCheckRequestDTO {
    @NotNull(message = "Budget amount is required")
    @DecimalMin(value = "0.01", message = "Budget must be greater than zero")
    private BigDecimal budget;

    private String cartId;

    public BudgetCheckRequestDTO() {
    }

    public BudgetCheckRequestDTO(BigDecimal budget, String cartId) {
        this.budget = budget;
        this.cartId = cartId;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }
}
