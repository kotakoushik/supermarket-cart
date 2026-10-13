package com.supermarket.cart.dto;

import java.util.ArrayList;
import java.util.List;

public class AnalystApplyRequestDTO {
    private String cartId;
    private List<AnalystActionDTO> selectedActions = new ArrayList<>();

    public AnalystApplyRequestDTO() {
    }

    public AnalystApplyRequestDTO(String cartId, List<AnalystActionDTO> selectedActions) {
        this.cartId = cartId;
        this.selectedActions = selectedActions;
    }

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }

    public List<AnalystActionDTO> getSelectedActions() {
        return selectedActions;
    }

    public void setSelectedActions(List<AnalystActionDTO> selectedActions) {
        this.selectedActions = selectedActions;
    }
}
