package com.supermarket.cart.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AnalystReportDTO {
    private String cartId;
    private BigDecimal currentTotal;
    private BigDecimal budget;
    private boolean overBudget;
    private BigDecimal budgetDifference;
    private double budgetUtilizationPercentage;

    private BigDecimal essentialSubtotal;
    private BigDecimal optionalSubtotal;
    private int essentialItemCount;
    private int optionalItemCount;

    private List<AnalystItemDTO> items = new ArrayList<>();
    private List<AnalystActionDTO> recommendedActions = new ArrayList<>();

    private BigDecimal totalPotentialSavings;
    private BigDecimal projectedTotal;
    private boolean fitsBudgetAfterChanges;
    private boolean budgetCoversEssentials;
    private String summaryMessage;

    public AnalystReportDTO() {
    }

    public AnalystReportDTO(String cartId, BigDecimal currentTotal, BigDecimal budget, boolean overBudget,
                            BigDecimal budgetDifference, double budgetUtilizationPercentage,
                            BigDecimal essentialSubtotal, BigDecimal optionalSubtotal,
                            int essentialItemCount, int optionalItemCount,
                            List<AnalystItemDTO> items, List<AnalystActionDTO> recommendedActions,
                            BigDecimal totalPotentialSavings, BigDecimal projectedTotal,
                            boolean fitsBudgetAfterChanges, boolean budgetCoversEssentials,
                            String summaryMessage) {
        this.cartId = cartId;
        this.currentTotal = currentTotal;
        this.budget = budget;
        this.overBudget = overBudget;
        this.budgetDifference = budgetDifference;
        this.budgetUtilizationPercentage = budgetUtilizationPercentage;
        this.essentialSubtotal = essentialSubtotal;
        this.optionalSubtotal = optionalSubtotal;
        this.essentialItemCount = essentialItemCount;
        this.optionalItemCount = optionalItemCount;
        this.items = items != null ? items : new ArrayList<>();
        this.recommendedActions = recommendedActions != null ? recommendedActions : new ArrayList<>();
        this.totalPotentialSavings = totalPotentialSavings;
        this.projectedTotal = projectedTotal;
        this.fitsBudgetAfterChanges = fitsBudgetAfterChanges;
        this.budgetCoversEssentials = budgetCoversEssentials;
        this.summaryMessage = summaryMessage;
    }

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }

    public BigDecimal getCurrentTotal() {
        return currentTotal;
    }

    public void setCurrentTotal(BigDecimal currentTotal) {
        this.currentTotal = currentTotal;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public boolean isOverBudget() {
        return overBudget;
    }

    public void setOverBudget(boolean overBudget) {
        this.overBudget = overBudget;
    }

    public BigDecimal getBudgetDifference() {
        return budgetDifference;
    }

    public void setBudgetDifference(BigDecimal budgetDifference) {
        this.budgetDifference = budgetDifference;
    }

    public double getBudgetUtilizationPercentage() {
        return budgetUtilizationPercentage;
    }

    public void setBudgetUtilizationPercentage(double budgetUtilizationPercentage) {
        this.budgetUtilizationPercentage = budgetUtilizationPercentage;
    }

    public BigDecimal getEssentialSubtotal() {
        return essentialSubtotal;
    }

    public void setEssentialSubtotal(BigDecimal essentialSubtotal) {
        this.essentialSubtotal = essentialSubtotal;
    }

    public BigDecimal getOptionalSubtotal() {
        return optionalSubtotal;
    }

    public void setOptionalSubtotal(BigDecimal optionalSubtotal) {
        this.optionalSubtotal = optionalSubtotal;
    }

    public int getEssentialItemCount() {
        return essentialItemCount;
    }

    public void setEssentialItemCount(int essentialItemCount) {
        this.essentialItemCount = essentialItemCount;
    }

    public int getOptionalItemCount() {
        return optionalItemCount;
    }

    public void setOptionalItemCount(int optionalItemCount) {
        this.optionalItemCount = optionalItemCount;
    }

    public List<AnalystItemDTO> getItems() {
        return items;
    }

    public void setItems(List<AnalystItemDTO> items) {
        this.items = items;
    }

    public List<AnalystActionDTO> getRecommendedActions() {
        return recommendedActions;
    }

    public void setRecommendedActions(List<AnalystActionDTO> recommendedActions) {
        this.recommendedActions = recommendedActions;
    }

    public BigDecimal getTotalPotentialSavings() {
        return totalPotentialSavings;
    }

    public void setTotalPotentialSavings(BigDecimal totalPotentialSavings) {
        this.totalPotentialSavings = totalPotentialSavings;
    }

    public BigDecimal getProjectedTotal() {
        return projectedTotal;
    }

    public void setProjectedTotal(BigDecimal projectedTotal) {
        this.projectedTotal = projectedTotal;
    }

    public boolean isFitsBudgetAfterChanges() {
        return fitsBudgetAfterChanges;
    }

    public void setFitsBudgetAfterChanges(boolean fitsBudgetAfterChanges) {
        this.fitsBudgetAfterChanges = fitsBudgetAfterChanges;
    }

    public boolean isBudgetCoversEssentials() {
        return budgetCoversEssentials;
    }

    public void setBudgetCoversEssentials(boolean budgetCoversEssentials) {
        this.budgetCoversEssentials = budgetCoversEssentials;
    }

    public String getSummaryMessage() {
        return summaryMessage;
    }

    public void setSummaryMessage(String summaryMessage) {
        this.summaryMessage = summaryMessage;
    }
}
