import React from 'react';

export default function SocialBubbles() {
  const links = {
    whatsapp: 'https://wa.me/50255981317', 
    facebook: 'https://www.facebook.com/share/15D5pqaNUQr/',
    instagram: 'https://www.instagram.com/muebleria_ramirez?igsh=MXB5aHphdmY2YmEyOQ=='
  };

  return (
    <div className="social-bubbles" aria-label="Redes sociales DCMR">
      <a className="bubble bubble-whatsapp" href={links.whatsapp} target="_blank" rel="noreferrer" title="WhatsApp">
        {/* WhatsApp */}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.5 3.5A11.94 11.94 0 0 0 12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.7 5.9L0 24l6.3-1.6A11.8 11.8 0 0 0 12 24c6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.5-8.5zM12 22a9.9 9.9 0 0 1-5-1.4l-.3-.2-3.7 1 1-3.6-.2-.3A10 10 0 1 1 22 12c0 5.5-4.5 10-10 10zm5.3-7.4c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.8.2-.3.4-.9 1-1.1 1.1-.2.1-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-1-.9-1.6-2-1.8-2.3-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.5.1-.8.4s-1 1-1 2.5 1 2.9 1.1 3.1c.1.2 2.1 3.3 5 4.6.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.3.2-1.4 0-.1-.2-.2-.5-.4z"/></svg>
      </a>

      <a className="bubble bubble-facebook" href={links.facebook} target="_blank" rel="noreferrer" title="Facebook">
        {/* Facebook */}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.2V12h2.2V9.8c0-2.2 1.3-3.4 3.3-3.4.96 0 1.97.17 1.97.17v2.17h-1.11c-1.1 0-1.44.68-1.44 1.38V12h2.46l-.39 2.9h-2.07v7A10 10 0 0 0 22 12z"/></svg>
      </a>

      <a className="bubble bubble-instagram" href={links.instagram} target="_blank" rel="noreferrer" title="Instagram">
        {/* Instagram */}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.4.4.6.2 1 .5 1.5 1 .5.5.8.9 1 1.5.2.5.3 1.2.4 2.4.1 1.2.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.4-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.5.2-1.2.3-2.4.4-1.2.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.4-.4a3.9 3.9 0 0 1-1.5-1c-.5-.5-.8-.9-1-1.5-.2-.5-.3-1.2-.4-2.4C2.2 15.6 2.2 15.1 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.4.2-.6.5-1 1-1.5.5-.5.9-.8 1.5-1 .5-.2 1.2-.3 2.4-.4C8.4 2.2 8.9 2.2 12 2.2m0-2.2C8.7 0 8.2 0 6.9.1 5.5.2 4.6.3 3.8.6 3 .9 2.3 1.3 1.6 2 1 2.6.6 3.3.3 4.1.1 4.9 0 5.8 0 7.1 0 8.3 0 8.8 0 12s0 3.7.1 4.9c.1 1.3.2 2.2.5 3 .3.8.7 1.5 1.3 2.2.6.6 1.3 1 2.1 1.3.8.3 1.7.4 3 .5 1.3.1 1.8.1 5.1.1s3.7 0 4.9-.1c1.3-.1 2.2-.2 3-.5.8-.3 1.5-.7 2.1-1.3.6-.6 1-1.3 1.3-2.1.3-.8.5-1.7.5-3 .1-1.3.1-1.8.1-5.1s0-3.7-.1-4.9c-.1-1.3-.2-2.2-.5-3-.3-.8-.7-1.5-1.3-2.1-.6-.6-1.3-1-2.1-1.3-.8-.3-1.7-.4-3-.5C15.7 0 15.2 0 12 0z"/><circle cx="18.4" cy="5.6" r="1.4" fill="currentColor"/><path fill="currentColor" d="M12 5.8A6.2 6.2 0 1 0 12 18.2 6.2 6.2 0 0 0 12 5.8m0 10.2A4 4 0 1 1 12 7.8a4 4 0 0 1 0 8.2z"/></svg>
      </a>
    </div>
  );
}
