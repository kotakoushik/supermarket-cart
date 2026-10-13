package com.supermarket.cart.dto;

import jakarta.validation.constraints.NotNull;

public class ProductStatusUpdateDTO {
    @NotNull(message = "Active status is required")
    private Boolean active;

    public ProductStatusUpdateDTO() {
    }

    public ProductStatusUpdateDTO(Boolean active) {
        this.active = active;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
