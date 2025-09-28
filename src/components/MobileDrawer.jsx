import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

function Item({ to, icon, children, onClick, end }) {
  return (
    <Link to={to} className="drawer__item" onClick={onClick} aria-current={end ? 'page' : undefined}>
      <span className="drawer__icon" aria-hidden="true">{icon}</span>
      <span className="drawer__label">{children}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" className="drawer__chev" aria-hidden="true">
        <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </Link>
  );
}

export default function MobileDrawer({ open, onClose }) {
  const { user, logout } = useAuth();
  const { show } = useToast();

  return (
    <>
      {/* Capa */}
      <div
        className={`drawer__overlay ${open ? 'is-open' : ''}`}
        role="button"
        aria-label="Cerrar menú"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`drawer ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div className="drawer__head">
          <strong className="drawer__brand">DCMR · Mueblería</strong>
          <button className="drawer__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <nav className="drawer__nav">
          <Item to="/" onClick={onClose}
            icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4V12H9v10H5a2 2 0 0 1-2-2z" fill="currentColor"/></svg>}
          >
            Inicio
          </Item>

          {}
          <Item to="/" onClick={onClose}
            icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 6h7v4H4zm9 0h7v4h-7zM4 14h7v4H4zm9 0h7v4h-7z" fill="currentColor"/></svg>}
          >
            Categorías
          </Item>

          <Item to="/mis-pedidos" onClick={onClose}
            icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
          >
            Pedidos
          </Item>

          <Item to="/carrito" onClick={onClose}
            icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12zM6 6l-1-3H2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          >
            Carrito
          </Item>

          <Item to="/mis-favoritos" onClick={onClose}
            icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 21s-7-4.438-7-10a4 4 0 0 1 7-2.646A4 4 0 0 1 19 11c0 5.562-7 10-7 10z" fill="currentColor"/></svg>}
          >
            Mis favoritos
          </Item>

          {/* Rol Admin */}
          {(user?.rol === 'admin' || user?.role === 'admin') && (
            <Item to="/admin" onClick={onClose}
              icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 3l9 4-9 4-9-4 9-4zm0 7l9 4-9 4-9-4 9-4z" fill="currentColor"/></svg>}
            >
              Admin
            </Item>
          )}
        </nav>

        <div className="drawer__foot">
          {user ? (
            <>
              <span className="drawer__user">Hola, <b>{user.nombre}</b></span>
              <div className="drawer__actions">
                {}
                <Link to="/perfil" className="drawer__btn" onClick={onClose}>Perfil</Link>
                <button
                  type="button"
                  className="drawer__btn drawer__btn--outline"
                  onClick={() => { logout(); show('Saliste de tu Cuenta', { type: 'success' }); onClose(); }}
                >
                  Salir
                </button>
              </div>
            </>
          ) : (
            <div className="drawer__actions">
              <Link to="/login" className="drawer__btn" onClick={onClose}>Login</Link>
              <Link to="/registro" className="drawer__btn drawer__btn--outline" onClick={onClose}>Registro</Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
