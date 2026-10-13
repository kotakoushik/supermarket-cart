package com.supermarket.cart.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CheckoutRequestDTO {
    @NotBlank(message = "Cart ID is required")
    private String cartId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Please provide a valid email address")
    private String customerEmail;

    private String customerPhone;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    private String paymentMethod = "COD";

    public CheckoutRequestDTO() {
    }

    public CheckoutRequestDTO(String cartId, String customerName, String customerEmail, String customerPhone, String deliveryAddress) {
        this.cartId = cartId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.deliveryAddress = deliveryAddress;
        this.paymentMethod = "COD";
    }

    public CheckoutRequestDTO(String cartId, String customerName, String customerEmail, String customerPhone, String deliveryAddress, String paymentMethod) {
        this.cartId = cartId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.deliveryAddress = deliveryAddress;
        this.paymentMethod = paymentMethod != null && !paymentMethod.isBlank() ? paymentMethod : "COD";
    }

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
