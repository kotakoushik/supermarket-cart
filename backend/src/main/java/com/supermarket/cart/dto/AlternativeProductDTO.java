package com.supermarket.cart.dto;

import java.math.BigDecimal;

public class AlternativeProductDTO {
    private Long originalProductId;
    private String originalProductName;
    private BigDecimal originalPrice;

    private Long alternativeProductId;
    private String alternativeProductName;
    private BigDecimal alternativePrice;
    private String category;
    private Integer stockQuantity;
    private String imageUrl;

    private BigDecimal savingsAmount;
    private Double savingsPercentage;
    private String reason;

    public AlternativeProductDTO() {
    }

    public AlternativeProductDTO(Long originalProductId, String originalProductName, BigDecimal originalPrice,
                                 Long alternativeProductId, String alternativeProductName, BigDecimal alternativePrice,
                                 String category, Integer stockQuantity, String imageUrl,
                                 BigDecimal savingsAmount, Double savingsPercentage, String reason) {
        this.originalProductId = originalProductId;
        this.originalProductName = originalProductName;
        this.originalPrice = originalPrice;
        this.alternativeProductId = alternativeProductId;
        this.alternativeProductName = alternativeProductName;
        this.alternativePrice = alternativePrice;
        this.category = category;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.savingsAmount = savingsAmount;
        this.savingsPercentage = savingsPercentage;
        this.reason = reason;
    }

    public Long getOriginalProductId() {
        return originalProductId;
    }

    public void setOriginalProductId(Long originalProductId) {
        this.originalProductId = originalProductId;
    }

    public String getOriginalProductName() {
        return originalProductName;
    }

    public void setOriginalProductName(String originalProductName) {
        this.originalProductName = originalProductName;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public Long getAlternativeProductId() {
        return alternativeProductId;
    }

    public void setAlternativeProductId(Long alternativeProductId) {
        this.alternativeProductId = alternativeProductId;
    }

    public String getAlternativeProductName() {
        return alternativeProductName;
    }

    public void setAlternativeProductName(String alternativeProductName) {
        this.alternativeProductName = alternativeProductName;
    }

    public BigDecimal getAlternativePrice() {
        return alternativePrice;
    }

    public void setAlternativePrice(BigDecimal alternativePrice) {
        this.alternativePrice = alternativePrice;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public BigDecimal getSavingsAmount() {
        return savingsAmount;
    }

    public void setSavingsAmount(BigDecimal savingsAmount) {
        this.savingsAmount = savingsAmount;
    }

    public Double getSavingsPercentage() {
        return savingsPercentage;
    }

    public void setSavingsPercentage(Double savingsPercentage) {
        this.savingsPercentage = savingsPercentage;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
