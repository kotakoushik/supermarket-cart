import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient, { getCartId } from '../api/client';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    cartId: getCartId(),
    items: [],
    totalItems: 0,
    subtotal: 0,
    tax: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('supermarket_budget');
    return saved ? parseFloat(saved) : 1000;
  });
  const [budgetResult, setBudgetResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [isAnalystOpen, setIsAnalystOpen] = useState(false);

  const openAnalyst = useCallback(() => setIsAnalystOpen(true), []);
  const closeAnalyst = useCallback(() => setIsAnalystOpen(false), []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkBudgetStatus = useCallback(async (currentBudget) => {
    if (!currentBudget || currentBudget <= 0) {
      setBudgetResult(null);
      return;
    }
    try {
      const res = await apiClient.post('/budget/check', {
        budget: parseFloat(currentBudget),
      });
      setBudgetResult(res.data);
    } catch (err) {
      console.error('Failed to check budget:', err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (budget && budget > 0) {
      localStorage.setItem('supermarket_budget', budget.toString());
      checkBudgetStatus(budget);
    } else {
      localStorage.removeItem('supermarket_budget');
      setBudgetResult(null);
    }
  }, [budget, cart.totalAmount, checkBudgetStatus]);

  const updateBudget = (amount) => {
    const val = amount === '' ? '' : parseFloat(amount);
    setBudget(val);
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const res = await apiClient.post('/cart/items', { productId, quantity });
      setCart(res.data);
      showToast('Added to cart successfully!', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      const res = await apiClient.put(`/cart/items/${productId}`, { quantity });
      setCart(res.data);
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const res = await apiClient.delete(`/cart/items/${productId}`);
      setCart(res.data);
      showToast('Item removed from cart', 'info');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const res = await apiClient.delete('/cart');
      setCart(res.data);
      showToast('Cart cleared', 'info');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        budget,
        budgetResult,
        toast,
        updateBudget,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
        showToast,
        isAnalystOpen,
        openAnalyst,
        closeAnalyst,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
