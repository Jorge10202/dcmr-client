import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Recuperar from './pages/Recuperar.jsx';
import Cart from './pages/Cart.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import MyOrders from './pages/MyOrders.jsx';
import Profile from './pages/Profile.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { ConfirmProvider } from './components/Confirm.jsx';
import Header from './components/Header.jsx';
import MyFavorites from './pages/MyFavorites.jsx';
import { FavoritesProvider } from './contexts/FavoritesContext.jsx';

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/c/:cat" element={<Home />} />   
              <Route path="/b/:q" element={<Home />} />     

              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/recuperar" element={<Recuperar />} />
              <Route path="/carrito" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/mis-pedidos" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/mis-favoritos" element={<MyFavorites />} />
              <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Routes>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
