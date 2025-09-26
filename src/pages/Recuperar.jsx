import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Recuperar(){
  const [correo, setCorreo] = useState('');
  const onSubmit = (e) => { e.preventDefault(); alert('Pronto agregamos recuperación por correo 😉'); };

  return (
    <div className="auth-page login-bg">
      <div className="auth-card" style={{maxWidth: 420}}>
        <h1 className="auth-title">Recuperar contraseña</h1>
        <form className="auth-form" onSubmit={onSubmit}>
          <input className="auth-input" placeholder="Tu correo" value={correo} onChange={e=>setCorreo(e.target.value)} />
          <button className="auth-btn">Enviar enlace</button>
        </form>
        <div className="auth-links" style={{marginTop:'.8rem'}}>
          <Link to="/login">Volver al login</Link>
        </div>
      </div>
    </div>
  );
}
