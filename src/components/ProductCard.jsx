import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useToast } from './Toast.jsx';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext.jsx';

export default function ProductCard({ p }) {
  const { user } = useAuth();
  const { add } = useCart();
  const { show } = useToast();
  const navigate = useNavigate();
  const { isFav, toggle } = useFavorites();
  const fav = isFav(p.id);

  const now = Date.now();
  const pct = Number(p.descuento_pct || 0);
  const startOk = !p.promo_inicio || new Date(p.promo_inicio).getTime() <= now;
  const endOk   = !p.promo_fin    || new Date(p.promo_fin).getTime()    >= now;
  const hasDisc = pct > 0 && startOk && endOk;
  const basePrice  = Number(p.precio) || 0;
  const finalPrice = hasDisc ? basePrice * (1 - pct / 100) : basePrice;

  return (
    <div className="card">
      <Link to={`/producto/${p.id}`} style={{ display: 'block' }}>
        {}
        <div
          style={{
            width: '100%',
            aspectRatio: '4 / 3',
            overflow: 'hidden',
            background: '#f7f1e6',
            position: 'relative' 
          }}
        >
          {hasDisc && (
            <span
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                padding: '4px 8px',
                borderRadius: 999,
                background: '#f0b400',
                color: '#2b1c15',
                fontWeight: 700,
                fontSize: 12,
                boxShadow: '0 2px 6px rgba(0,0,0,.12)'
              }}
            >
              -{pct}%
            </span>
          )}
          <img
            src={
              p.imagen1 ||
              'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format'
            }
            alt={p.nombre}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
      </Link>

      <div className="card-body">
        <Link to={`/producto/${p.id}`}><strong>{p.nombre}</strong></Link>

        {}
        <div className="price" style={{ marginTop: 6 }}>
          {hasDisc ? (
            <>
              <span
                style={{
                  textDecoration: 'line-through',
                  color: '#9a8d83',
                  marginRight: 8,
                  fontSize: '.95rem'
                }}
              >
                Q {basePrice.toFixed(2)}
              </span>
              <strong>Q {finalPrice.toFixed(2)}</strong>
            </>
          ) : (
            <>Q {basePrice.toFixed(2)}</>
          )}
        </div>

        <button
            className="fav-btn"
            onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); toggle(p.id); }}
            title={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-label="Favorito"
            style={{
              position:'absolute', right:8, top:8, border:'none', background:'transparent',
              cursor:'pointer', lineHeight:1, padding:4
            }}
              >
            <svg width="26" height="26" viewBox="0 0 24 24"
                fill={fav ? '#e63946' : 'none'} stroke="#e63946" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
            </svg>
        </button>

        <button
          className="btn"
          onClick={() => {
            if (user) return add(p.id, 1);
            show('Inicia sesión para agregar al carrito', {
              type: 'warning',
              actionText: 'Ir a Login',
              onAction: () => navigate('/login')
            });
          }}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
