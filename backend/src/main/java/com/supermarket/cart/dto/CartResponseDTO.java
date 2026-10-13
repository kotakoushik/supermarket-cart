package com.supermarket.cart.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartResponseDTO {
    private String cartId;
    private List<CartItemResponseDTO> items = new ArrayList<>();
    private int totalItems;
    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal tax = BigDecimal.ZERO; // e.g. 5% GST or 0 for basic demo
    private BigDecimal totalAmount = BigDecimal.ZERO;

    public CartResponseDTO() {
    }

    public CartResponseDTO(String cartId, List<CartItemResponseDTO> items, int totalItems, BigDecimal subtotal, BigDecimal tax, BigDecimal totalAmount) {
        this.cartId = cartId;
        this.items = items;
        this.totalItems = totalItems;
        this.subtotal = subtotal;
        this.tax = tax;
        this.totalAmount = totalAmount;
    }

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }

    public List<CartItemResponseDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponseDTO> items) {
        this.items = items;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
