import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

export const AuthContext = createContext(null);

const CUSTOMER_TOKEN_KEY = 'freshcart_customer_token';
const ADMIN_KEY_STORAGE = 'freshcart_admin_key';

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem(CUSTOMER_TOKEN_KEY));
  const [isAdmin, setIsAdmin] = useState(() => Boolean(sessionStorage.getItem(ADMIN_KEY_STORAGE)));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Validate and load customer profile if token exists
  const loadCustomerProfile = useCallback(async (token) => {
    if (!token) {
      setCustomer(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get('/auth/me', {
        headers: { 'X-Customer-Token': token, Authorization: `Bearer ${token}` }
      });
      setCustomer(res.data);
    } catch (err) {
      console.warn('Customer session expired or invalid:', err.message);
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      setCustomerToken(null);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (customerToken) {
      loadCustomerProfile(customerToken);
    } else {
      setLoading(false);
    }
  }, [customerToken, loadCustomerProfile]);

  const customerLogin = async (email, password) => {
    setAuthError(null);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const data = res.data;
      localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
      setCustomerToken(data.token);
      setCustomer(data.customer);
      return { success: true, customer: data.customer };
    } catch (err) {
      const message = err.message || 'Login failed. Please check your credentials.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const customerRegister = async ({ fullName, email, password, phone, address }) => {
    setAuthError(null);
    try {
      const res = await apiClient.post('/auth/register', {
        fullName,
        email,
        password,
        phone,
        address
      });
      const data = res.data;
      localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
      setCustomerToken(data.token);
      setCustomer(data.customer);
      return { success: true, customer: data.customer };
    } catch (err) {
      const message = err.message || 'Registration failed. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const customerLogout = async () => {
    try {
      if (customerToken) {
        await apiClient.post('/auth/logout');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      setCustomerToken(null);
      setCustomer(null);
    }
  };

  const adminLogin = async (username, password) => {
    setAuthError(null);
    try {
      const res = await apiClient.post('/admin/auth/login', { username, password });
      const data = res.data;
      const keyOrToken = data.token;
      sessionStorage.setItem(ADMIN_KEY_STORAGE, keyOrToken);
      setIsAdmin(true);
      return { success: true, data };
    } catch (err) {
      const message = err.message || 'Invalid administrator credentials.';
      return { success: false, error: message };
    }
  };

  const adminLogout = async () => {
    try {
      await apiClient.post('/admin/auth/logout');
    } catch (e) {
      // Ignore network error on logout
    } finally {
      sessionStorage.removeItem(ADMIN_KEY_STORAGE);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        customerToken,
        isAuthenticated: Boolean(customer),
        isAdmin,
        loading,
        authError,
        setAuthError,
        customerLogin,
        customerRegister,
        customerLogout,
        adminLogin,
        adminLogout,
        reloadProfile: () => loadCustomerProfile(customerToken)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
