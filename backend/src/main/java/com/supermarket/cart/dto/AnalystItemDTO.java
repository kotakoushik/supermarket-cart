package com.supermarket.cart.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AnalystItemDTO {
    private Long productId;
    private String productName;
    private String category;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private String imageUrl;
    private boolean essential;
    private String categoryClassification; // "ESSENTIAL" or "OPTIONAL"
    private String classificationReason;
    private AlternativeProductDTO alternative;
    private List<AnalystActionDTO> actions = new ArrayList<>();

    public AnalystItemDTO() {
    }

    public AnalystItemDTO(Long productId, String productName, String category, BigDecimal unitPrice,
                          Integer quantity, BigDecimal subtotal, String imageUrl, boolean essential,
                          String categoryClassification, String classificationReason,
                          AlternativeProductDTO alternative, List<AnalystActionDTO> actions) {
        this.productId = productId;
        this.productName = productName;
        this.category = category;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.imageUrl = imageUrl;
        this.essential = essential;
        this.categoryClassification = categoryClassification;
        this.classificationReason = classificationReason;
        this.alternative = alternative;
        this.actions = actions != null ? actions : new ArrayList<>();
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isEssential() {
        return essential;
    }

    public void setEssential(boolean essential) {
        this.essential = essential;
    }

    public String getCategoryClassification() {
        return categoryClassification;
    }

    public void setCategoryClassification(String categoryClassification) {
        this.categoryClassification = categoryClassification;
    }

    public String getClassificationReason() {
        return classificationReason;
    }

    public void setClassificationReason(String classificationReason) {
        this.classificationReason = classificationReason;
    }

    public AlternativeProductDTO getAlternative() {
        return alternative;
    }

    public void setAlternative(AlternativeProductDTO alternative) {
        this.alternative = alternative;
    }

    public List<AnalystActionDTO> getActions() {
        return actions;
    }

    public void setActions(List<AnalystActionDTO> actions) {
        this.actions = actions;
    }
}
