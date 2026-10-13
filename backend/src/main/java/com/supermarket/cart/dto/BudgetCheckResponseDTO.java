package com.supermarket.cart.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class BudgetCheckResponseDTO {
    private BigDecimal budget;
    private BigDecimal currentTotal;
    private boolean overBudget;
    private BigDecimal difference; // positive if over budget, negative or zero if under
    private double utilizationPercentage;
    private String statusMessage;
    private List<AlternativeProductDTO> suggestedAlternatives = new ArrayList<>();

    public BudgetCheckResponseDTO() {
    }

    public BudgetCheckResponseDTO(BigDecimal budget, BigDecimal currentTotal, boolean overBudget, BigDecimal difference, double utilizationPercentage, String statusMessage, List<AlternativeProductDTO> suggestedAlternatives) {
        this.budget = budget;
        this.currentTotal = currentTotal;
        this.overBudget = overBudget;
        this.difference = difference;
        this.utilizationPercentage = utilizationPercentage;
        this.statusMessage = statusMessage;
        this.suggestedAlternatives = suggestedAlternatives;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public BigDecimal getCurrentTotal() {
        return currentTotal;
    }

    public void setCurrentTotal(BigDecimal currentTotal) {
        this.currentTotal = currentTotal;
    }

    public boolean isOverBudget() {
        return overBudget;
    }

    public void setOverBudget(boolean overBudget) {
        this.overBudget = overBudget;
    }

    public BigDecimal getDifference() {
        return difference;
    }

    public void setDifference(BigDecimal difference) {
        this.difference = difference;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public List<AlternativeProductDTO> getSuggestedAlternatives() {
        return suggestedAlternatives;
    }

    public void setSuggestedAlternatives(List<AlternativeProductDTO> suggestedAlternatives) {
        this.suggestedAlternatives = suggestedAlternatives;
    }
}
