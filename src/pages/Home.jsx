import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard.jsx';
import SocialBubbles from '../components/SocialBubbles.jsx';
import SidePromo from '../components/SidePromo.jsx';


export default function Home(){
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [active, setActive] = useState('all');
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const { cat, q } = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const catFromPath = params.cat || null;          
    const qFromPath   = params.q   || null;          
    return {
      cat: catFromPath || sp.get('cat') || 'all',
      q:   qFromPath   || sp.get('q')   || ''
    };
  }, [location.search, params.cat, params.q]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/products', {
          params: {
            ...(cat && cat !== 'all' ? { cat } : {}),
            ...(q ? { q } : {})
          }
        });
        const safe = Array.isArray(data) ? data : [];
        if (mounted) { setProducts(safe); setActive(cat); }
      } catch (e) {
        console.error('Error cargando productos', e?.response?.data || e?.message);
        if (mounted) { setProducts([]); setActive(cat); }
      }
    })();
    return () => { mounted = false; };
  }, [cat, q]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/categories');
        const safe = Array.isArray(data) ? data : [];
        if (mounted) setCats(safe);
      } catch (e) {
        console.error('Error cargando categorías', e?.response?.data || e?.message);
        if (mounted) setCats([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const gotoCat = (val) => {
    if (!val || val === 'all') navigate('/');
    else navigate(`/c/${val}`);
  };

  const [mQuery, setMQuery] = useState('');
  useEffect(() => { setMQuery(q || ''); }, [q]);

  const visibleProducts = useMemo(() => {
    const term = mQuery.trim().toLowerCase();
    if (!term) return products;
    return products.filter(p => {
      const hay = (s) => String(s || '').toLowerCase().includes(term);
      return hay(p.nombre) || hay(p.descripcion) || hay(p.categoria_nombre);
    });
  }, [products, mQuery]);

  const onMobileSearch = (e) => {
    e.preventDefault(); 
  };

  return (
    <div className="container">
      <section className="hero hero--top">
        <h1>Distribuidora Comercial Ramírez</h1>
        <p>Diseño, calidad y atención cercana para amueblar tu hogar con estilo y durabilidad.</p>
      </section>

      {}
      <div className="mobile-search" style={{ margin: '8px 0' }}>
        <form onSubmit={onMobileSearch} className="mobile-search__form" style={{ display:'flex', gap:8 }}>
          <input
            type="text"
            className="input"
            placeholder="Buscar producto..."
            value={mQuery}
            onChange={(e)=>setMQuery(e.target.value)}
            style={{ flex:1 }}
          />
          <button className="btn" type="submit">Buscar</button>
        </form>
      </div>

      <div className="catbar">
        <button
          onClick={() => gotoCat('all')}
          className={`catbtn ${active==='all'?'active':''}`}
        >
          Todos
        </button>
        {cats.map(c=> (
          <button key={c.id}
                  className={`catbtn ${String(active)===String(c.id)?'active':''}`}
                  onClick={()=>gotoCat(String(c.id))}>
            {c.nombre}
          </button>
        ))}
      </div>

      <div className="container">
        {}
        <SocialBubbles />
      </div>

      <SidePromo phone="+502 1234-5678" wa="50212345678" />

      <div className="products-grid">
        {visibleProducts.map(p => <ProductCard key={p.id} p={p} />)}
      </div>

      {visibleProducts.length===0 && (
        <p>
          {mQuery
            ? `No hay resultados para “${mQuery}” en esta categoría.`
            : (q
              ? `No se encontraron productos con “${q}”.`
              : 'No hay productos para esta categoría.'
            )}
        </p>
      )}
    </div>
  );
}
