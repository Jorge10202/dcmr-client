import React, { useEffect, useState } from 'react';
import favoritesApi from '../api/favorites';
import ProductCard from '../components/ProductCard.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext.jsx';

export default function MyFavorites(){
  const { user } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [prods, setProds] = useState([]);
  const { ids } = useFavorites(); 

  useEffect(() => {
    if (!user) {
      show('Inicia sesión para ver tus favoritos', {
        type:'warning', actionText:'Login', onAction:()=>navigate('/login')
      });
      return;
    }
    (async () => {
      try {
        const data = await favoritesApi.list();
        setProds(Array.isArray(data) ? data : []);
      } catch {
        setProds([]);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await favoritesApi.list();
        setProds(Array.isArray(data) ? data : []);
      } catch {
        setProds([]);
      }
    })();
  }, [ids, user]);

  if (!user) return null;

  return (
    <div className="container">
      <div className="header" style={{ marginBottom: 16 }}>
        <h1>Mis Favoritos</h1>
        <p>Productos que marcaste como favoritos ❤️</p>
      </div>

      <div className="products-grid" style={{ marginTop: 8 }}>
        {prods.map((prod) => (
          <ProductCard key={prod.id} p={prod} />
        ))}
      </div>

      {prods.length === 0 && <p>No has marcado favoritos aún.</p>}
    </div>
  );
}
