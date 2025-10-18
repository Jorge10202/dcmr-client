import React, { useEffect, useRef, useState } from 'react';
import api from '../api';

// Banners de respaldo (se muestran si /api/promos falla o viene vacío)
const DEMO_SLIDES = [
  {
    id: 'demo-1',
    title: 'Halloween',
    text: 'Promos de temporada 🎃',
    image_url: 'https://res.cloudinary.com/darxqeoa6/image/upload/v1760757741/halloween_pzdenm.png',
    link: '',
  },
  {
    id: 'demo-2',
    title: 'Halloween',
    text: 'Halloween a la medida ✨',
    image_url: 'https://res.cloudinary.com/darxqeoa6/image/upload/v1760758254/promo_phkknl.png',
    link: '',
  },
  {
    id: 'demo-3',
    title: 'Ofertas de Fin de Año',
    text: 'Descuentos por tiempo limitado 🎁',
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop',
    link: '',
  },
];

const AUTOPLAY_MS = 5000;

export default function BannerSlider() {
  const [slides, setSlides] = useState([]);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await api.get('', { params: { limit: 5 } });
        const arr = Array.isArray(data) ? data : [];
        if (mounted) setSlides(arr.length ? arr : DEMO_SLIDES);
      } catch {
        if (mounted) setSlides(DEMO_SLIDES);
      }
    })();

    return () => {
      mounted = false;
      clearInterval(timerRef.current);
    };
  }, []);


  useEffect(() => {
    if (slides.length <= 1) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setIdx(i => (i + 1) % slides.length),
      AUTOPLAY_MS
    );
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  if (!slides.length) return null;

  const go = dir => setIdx(i => (i + dir + slides.length) % slides.length);

  const imgOf = s => s.image_url || s.image || s.url || s.banner || '';
  const hrefOf = s => s.link || s.href || '';
  const titleOf = s => s.title || s.titulo || '';
  const textOf = s => s.text || s.descripcion || s.description || '';

  return (
    <div className="banner">
      {slides.map((s, i) => (
        <a
          key={s.id || i}
          className={`banner__slide ${i === idx ? 'is-active' : ''}`}
          href={hrefOf(s) || undefined}
          target={hrefOf(s) ? '_blank' : undefined}
          rel={hrefOf(s) ? 'noreferrer' : undefined}
        >
          <img src={imgOf(s)} alt={titleOf(s) || 'Promoción'} />
          {(titleOf(s) || textOf(s)) && (
            <div className="banner__caption">
              {titleOf(s) && <h3>{titleOf(s)}</h3>}
              {textOf(s) && <p>{textOf(s)}</p>}
            </div>
          )}
        </a>
      ))}

      <button
        className="banner__nav banner__nav--prev"
        onClick={() => go(-1)}
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        className="banner__nav banner__nav--next"
        onClick={() => go(1)}
        aria-label="Siguiente"
      >
        ›
      </button>

      <div className="banner__dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={i === idx ? 'is-active' : ''}
            onClick={() => setIdx(i)}
            aria-label={`Ir al banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}