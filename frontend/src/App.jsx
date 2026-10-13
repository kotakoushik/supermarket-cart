import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useCart } from './context/useCart';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ShoppingAnalystPanel from './components/ShoppingAnalystPanel';
import AnalystFloatingButton from './components/AnalystFloatingButton';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastNotification = () => {
  const { toast } = useCart();
  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${toast.type}`}>
        {toast.type === 'success' && <CheckCircle2 size={18} />}
        {toast.type === 'error' && <AlertCircle size={18} />}
        {toast.type === 'info' && <Info size={18} />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/confirmation/:id" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
            <ShoppingAnalystPanel />
            <AnalystFloatingButton />
            <ToastNotification />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
