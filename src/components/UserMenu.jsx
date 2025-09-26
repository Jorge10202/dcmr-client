import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function UserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    const onClick = (e) => { if (open && ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [open]);

  if (!user) return null;

  return (
    <div className="usermenu" ref={ref}>
      <button className="btn" onClick={() => setOpen(o => !o)}>
        Hola, {user.nombre?.split(' ')[0] || 'Usuario'}
      </button>
      {open && (
        <div className="usermenu-pop">
          <div className="usermenu-head">
            <div className="usermenu-avatar">{user.nombre?.[0]?.toUpperCase() || 'U'}</div>
            <div className="usermenu-name">{user.nombre}</div>
            <div className="usermenu-mail">{user.correo}</div>
          </div>
          <Link to="/perfil" className="usermenu-item" onClick={() => setOpen(false)}>Mi perfil</Link>
          <Link to="/mis-pedidos" className="usermenu-item" onClick={() => setOpen(false)}>Mis pedidos</Link>
           <Link to="/mis-favoritos" className="usermenu-item" onClick={() => setOpen(false)}>Favoritos</Link>
          {isAdmin() && (
            <Link to="/admin" className="usermenu-item" onClick={() => setOpen(false)}>Panel admin</Link>
          )}
          <button
            className="usermenu-item danger"
            onClick={() => { setOpen(false); logout(); nav('/'); }}
          >
            Salir
          </button>
        </div>
      )}
    </div>
  );
}
