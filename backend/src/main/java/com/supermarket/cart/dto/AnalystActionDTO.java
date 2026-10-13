package com.supermarket.cart.dto;

import java.math.BigDecimal;

public class AnalystActionDTO {
    private String id;
    private Long productId;
    private String productName;
    private String actionType; // "REPLACE", "REDUCE_QUANTITY", "REMOVE"
    private String label;
    private Long replacementProductId;
    private String replacementProductName;
    private Integer targetQuantity;
    private BigDecimal estimatedSavings;
    private String reason;

    public AnalystActionDTO() {
    }

    public AnalystActionDTO(String id, Long productId, String productName, String actionType,
                            String label, Long replacementProductId, String replacementProductName,
                            Integer targetQuantity, BigDecimal estimatedSavings, String reason) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.actionType = actionType;
        this.label = label;
        this.replacementProductId = replacementProductId;
        this.replacementProductName = replacementProductName;
        this.targetQuantity = targetQuantity;
        this.estimatedSavings = estimatedSavings;
        this.reason = reason;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Long getReplacementProductId() {
        return replacementProductId;
    }

    public void setReplacementProductId(Long replacementProductId) {
        this.replacementProductId = replacementProductId;
    }

    public String getReplacementProductName() {
        return replacementProductName;
    }

    public void setReplacementProductName(String replacementProductName) {
        this.replacementProductName = replacementProductName;
    }

    public Integer getTargetQuantity() {
        return targetQuantity;
    }

    public void setTargetQuantity(Integer targetQuantity) {
        this.targetQuantity = targetQuantity;
    }

    public BigDecimal getEstimatedSavings() {
        return estimatedSavings;
    }

    public void setEstimatedSavings(BigDecimal estimatedSavings) {
        this.estimatedSavings = estimatedSavings;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
