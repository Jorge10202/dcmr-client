import React, { useEffect, useRef, useState } from 'react';

export default function ImageCarousel({ images = [], alt = 'Imagen', ratio = null }) {
  const clean = images.filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const startX = useRef(null);

  const hasMany = clean.length > 1;
  const go = (n) => setIdx((p) => (p + n + clean.length) % clean.length);
  const goTo = (i) => setIdx(i);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onTouchStart = (e) => (startX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) go(dx > 0 ? -1 : 1);
    startX.current = null;
  };

  const fallback = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format';
  const imgs = clean.length ? clean : [fallback];

  return (
    <>
      {/* Carrusel embebido */}
      <div className="carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div
          className="carousel-viewport"
          style={ratio ? { aspectRatio: ratio } : undefined}
          onClick={() => setLightbox(true)}
          title="Ver imagen"
        >
          <div className="carousel-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
            {imgs.map((src, i) => (
              <div className="carousel-slide" key={i}>
                <img src={src} alt={`${alt} ${i + 1}`} />
              </div>
            ))}
          </div>
          {hasMany && (
            <>
              <button className="carousel-arrow left" onClick={(e)=>{e.stopPropagation(); go(-1);}} aria-label="Anterior">‹</button>
              <button className="carousel-arrow right" onClick={(e)=>{e.stopPropagation(); go(1);}} aria-label="Siguiente">›</button>
            </>
          )}
        </div>

        {hasMany && (
          <div className="carousel-dots">
            {imgs.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot ${i === idx ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Caja */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <img
            src={imgs[idx]}
            alt={`${alt} ${idx + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          {hasMany && (
            <>
              <button className="lb-arrow left"  onClick={(e)=>{e.stopPropagation(); go(-1);}} aria-label="Anterior">‹</button>
              <button className="lb-arrow right" onClick={(e)=>{e.stopPropagation(); go(1);}}  aria-label="Siguiente">›</button>
            </>
          )}
          <button className="lb-close" onClick={()=>setLightbox(false)} aria-label="Cerrar">×</button>
        </div>
      )}
    </>
  );
}
