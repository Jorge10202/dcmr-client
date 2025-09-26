import React, { useState } from 'react';

export default function SidePromo({
  phone = '+502 5598-1317',                
  wa = '50255981317',                      
}) {
  const [open, setOpen] = useState(true);

  const telHref = `tel:${phone.replace(/\s+/g, '')}`;
  const waHref  = `https://wa.me/50255981317?text=${encodeURIComponent(
    'Hola, quisiera cotizar un mueble a la medida.'
  )}`;

  return (
    <aside className={`promo-note ${open ? 'open' : ''}`} role="complementary" aria-label="Muebles a la medida">
      <button
        className="promo-note__toggle"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Ocultar aviso' : 'Mostrar aviso'}
        title={open ? 'Ocultar' : 'Mostrar'}
      >
        {open ? '‹' : '›'}
      </button>

      <div className="promo-note__content">
        <strong>¿Muebles a la medida?</strong>
        <p style={{margin: '6px 0 10px'}}>
          Se realizan muebles a la medida. Para más información comuníquese al +502 5598-1317 <b></b>.
        </p>
        <div className="promo-note__actions">
          <a className="btn" href={telHref}>Llamar</a>
          <a className="btn btn-outline" href={waHref} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>
    </aside>
  );
}
