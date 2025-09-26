import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useToast } from '../components/Toast.jsx';
import ImageCarousel from '../components/ImageCarousel.jsx';
import { useFavorites } from '../contexts/FavoritesContext.jsx';

export default function ProductDetail(){
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const { user } = useAuth();
  const { add } = useCart();
  const { show } = useToast();
  const navigate = useNavigate();
  const { isFav, toggle } = useFavorites();
  const fav = isFav(id);

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setP(data));
  }, [id]);

  if (!p) return (
    <div className="container"><p>Cargando...</p></div>
  );

  const pct = Number(p?.descuento_pct || 0);
  const startOk = !p?.promo_inicio || new Date(p.promo_inicio).getTime() <= Date.now();
  const endOk   = !p?.promo_fin    || new Date(p.promo_fin).getTime()    >= Date.now();
  const hasDisc = pct > 0 && startOk && endOk;

  const basePrice  = Number(p.precio) || 0;
  const finalPrice = hasDisc ? +(basePrice * (1 - pct/100)).toFixed(2) : basePrice;

  const discountPercent =
    p?.descuento_pct ?? p?.discount_percent ?? p?.descuento_porcentaje ?? p?.descuento ?? null;
  const discountFrom =
    p?.promo_inicio ?? p?.discount_start ?? p?.descuento_desde ?? p?.discountFrom ?? null;
  const discountTo =
    p?.promo_fin ?? p?.discount_end ?? p?.descuento_hasta ?? p?.discountTo ?? null;

  const fmtDate = (d) => {
    if (!d) return '';
    const dd = new Date(d);
    if (isNaN(dd)) return '';
    return dd.toLocaleDateString(); 
  };

  return (
    <div className="container">
      <div className="product-detail">
        <div className="product-detail__media">
          <div className="media-box">
            <ImageCarousel
              images={[p.imagen1, p.imagen2].filter(Boolean)}
              alt={p.nombre}
              ratio="4 / 3"
            />
          </div>
        </div>

        <div className="product-detail__info form">
          <h2>{p.nombre}</h2>

          <div className="price" style={{ fontSize: '1.4rem' }}>
            {hasDisc ? (
              <>
                <span
                  style={{
                    textDecoration: 'line-through',
                    color: '#9a8d83',
                    marginRight: 8
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

          {(discountPercent || discountFrom || discountTo) && (
            <div
              style={{
                marginTop: 8,
                marginBottom: 8,
                padding: '10px 12px',
                background: '#FFF8E1',
                border: '1px solid #F6E3A5',
                borderRadius: 10,
              }}
            >
              <div style={{ fontWeight: 700, color: '#8B5E3C' }}>
                Descuento{discountPercent ? `: ${Number(discountPercent)}%` : ''}
              </div>
              {(discountFrom || discountTo) && (
                <div style={{ fontSize: '.9rem', color: '#5c4b3a' }}>
                  {discountFrom ? `Inicio: ${fmtDate(discountFrom)}` : ''}
                  {discountFrom && discountTo ? ' · ' : ''}
                  {discountTo ? `Finaliza: ${fmtDate(discountTo)}` : ''}
                </div>
              )}
            </div>
          )}

          <p>{p.descripcion}</p>
          <p><strong>Stock:</strong> {p.stock}</p>

          <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'space-between' }}>
            <h2 style={{ margin:0 }}></h2>
            <button
              className="fav-btn"
              onClick={()=>toggle(p.id)}
              title={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              aria-label="Favorito"
              style={{ border:'none', background:'transparent', cursor:'pointer', padding:4 }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24"
                  fill={fav ? '#e63946' : 'none'} stroke="#e63946" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
              </svg>
            </button>
          </div>


          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              max={p.stock}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="input"
              style={{ width: 120 }}
            />
            <button
              className="btn"
              onClick={() => {
                if (user) return add(p.id, qty, hasDisc ? finalPrice : undefined);
                show('Inicia sesión para agregar al carrito', {
                  type: 'warning',
                  actionText: 'Ir a Login',
                  onAction: () => navigate('/login'),
                });
              }}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
