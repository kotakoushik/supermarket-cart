package com.supermarket.cart.dto;

public class AuthResponseDTO {
    private String token;
    private CustomerResponseDTO customer;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(String token, CustomerResponseDTO customer) {
        this.token = token;
        this.customer = customer;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public CustomerResponseDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerResponseDTO customer) {
        this.customer = customer;
    }
}
