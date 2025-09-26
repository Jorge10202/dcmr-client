import React, { createContext, useContext, useEffect, useState } from 'react';
import favoritesApi from '../api/favorites';
import { useAuth } from './AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

const FavCtx = createContext();
export const useFavorites = () => useContext(FavCtx);

export function FavoritesProvider({ children }){
  const { user } = useAuth();
  const { show } = useToast();
  const [ids, setIds] = useState(new Set());  

  const load = async () => {
    try {
      if (!user) return setIds(new Set());
      const { ids: arr } = await favoritesApi.ids();
      setIds(new Set(arr || []));
    } catch(e){ }
  };

  useEffect(() => { load(); }, [user]);

  const isFav = (productId) => ids.has(Number(productId));

  const toggle = async (productId) => {
    if (!user) { show('Inicia sesión para usar Favoritos', { type:'warning' }); return; }
    const id = Number(productId);
    const newSet = new Set(ids);
    const already = newSet.has(id);
    already ? newSet.delete(id) : newSet.add(id);
    setIds(newSet);

    try {
      await favoritesApi.toggle(id, already);
      show(already ? 'Se quitó de favoritos' : 'Se agregó a favoritos', { type:'success' });
    } catch (e) {
      const revert = new Set(newSet);
      already ? revert.add(id) : revert.delete(id);
      setIds(revert);
      show('No se pudo actualizar favorito', { type:'error' });
    }
  };

  return (
    <FavCtx.Provider value={{ ids, isFav, toggle, reload: load }}>
      {children}
    </FavCtx.Provider>
  );
}
