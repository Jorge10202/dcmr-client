import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import MobileDrawer from './MobileDrawer.jsx'; 

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count } = useCart(); 
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const onSearch = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q')?.trim();
    if (q) navigate(`/b/${encodeURIComponent(q)}`);
    close();
  };

  return (
    <header className="site-header">
      <div className="site-header__bar container">
        <Link to="/" className="brand" onClick={close}>
          <img
            src="/Logo.png"
            srcSet="/Logo.png 1x, /Logo.png 2x"
            alt="Mueblería Ramírez"
          />
          <strong>DCMR ·</strong> Mueblería
        </Link>

        {}
        <form className="search mobile-hide" onSubmit={onSearch}>
          <input name="q" type="text" placeholder="Buscar producto..." />
          <button className="btn" type="submit">Buscar</button>
        </form>

        {}
        <nav className="actions mobile-hide">
          <Link className="btn" to="/">Inicio</Link>
          <Link className="btn" to="/c/all">Categorías</Link>
          <Link className="btn" to="/mis-pedidos">Pedidos</Link>
          <Link className="btn" to="/carrito">Carrito <span className="badge">{count ?? 0}</span></Link>
          {user ? (
            <div className="user-chip">
              <span>Hola, {user.nombre?.split(' ')[0] || 'Usuario'}</span>
              <button className="btn btn-outline" onClick={logout}>Salir</button>
            </div>
          ) : (
            <>
              <Link className="btn" to="/login">Login</Link>
              <Link className="btn btn-outline" to="/registro">Registro</Link>
            </>
          )}
        </nav>

        {}
        <button
          className="nav-toggle hamburger"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen(s => !s)}
        >
          {}
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {}
      <MobileDrawer open={open} onClose={close} />
    </header>
  );
}
