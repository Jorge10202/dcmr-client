import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

const CartCtx = createContext();
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }){
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const { show } = useToast();

  const fetchCart = async () => {
    try { const { data } = await api.get('/cart'); setItems(data.items || []); } catch {}
  };

  useEffect(() => { if (user) fetchCart(); else setItems([]); }, [user]);

  const add = async (productId, quantity = 1, priceSnapshot ) => {
    const payload = { productId, quantity };
    if (priceSnapshot != null) payload.price_snapshot = Number(priceSnapshot);
    await api.post('/cart/add', payload);
    await fetchCart();
    show('Producto agregado al carrito', { type: 'success' });
  };

  const updateQty = async (itemId, quantity) => { await api.put(`/cart/item/${itemId}`, { quantity }); await fetchCart(); };
  const remove = async (itemId) => { await api.delete(`/cart/item/${itemId}`); await fetchCart(); show('Producto eliminado del carrito', { type: 'success' }); };
  const checkout = async () => { const { data } = await api.post('/orders/checkout'); await fetchCart(); return data; };

  return <CartCtx.Provider value={{ items, add, updateQty, remove, checkout }}>{children}</CartCtx.Provider>;
}
