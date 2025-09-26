import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import UserMenu from './UserMenu.jsx';
import api from '../api';
import MobileDrawer from './MobileDrawer.jsx'; 

export default function Navbar(){
  const { user } = useAuth();
  const { items } = useCart();
  const [categories, setCategories] = useState([]);
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);           
  const navigate = useNavigate();
  const location = useLocation();
  const debounceRef = useRef(null);

  const close = () => setOpen(false);              

  useEffect(() => {
    let mounted = true;
    api.get('/categories')
      .then(({data}) => mounted && setCategories(Array.isArray(data) ? data : []))
      .catch(() => mounted && setCategories([]));
    return () => { mounted = false; };
  }, []);

  const currentCat = useMemo(() => {
    const m = location.pathname.match(/^\/c\/([^/]+)/);
    if (m) return m[1];
    const sp = new URLSearchParams(location.search);
    return sp.get('cat') || 'all';
  }, [location.pathname, location.search]);

  useEffect(() => {
    const m = location.pathname.match(/^\/b\/([^/]+)/);
    if (m) setTerm(decodeURIComponent(m[1]));
    else {
      const sp = new URLSearchParams(location.search);
      setTerm(sp.get('q') || '');
    }
  }, [location.pathname, location.search]);

  const isAdmin = (user?.role || user?.rol) === 'admin';

  const onChangeCat = (e) => {
    const v = e.target.value;
    if (!v || v === 'all') navigate('/');
    else navigate(`/c/${v}`);
    setOpen(false);                                 
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const q = term.trim();
    if (q) navigate(`/b/${encodeURIComponent(q)}`);
    else navigate('/');
    setOpen(false);                      
  };

  const onChangeTerm = (e) => {
    const v = e.target.value;
    setTerm(v);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = v.trim();
      if (q) navigate(`/b/${encodeURIComponent(q)}`, { replace: true });
      else navigate('/', { replace: true });
    }, 300);
  };

  return (
    <div className="navbar">
      <div className="container inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img
            src="/Logo.png"
            srcSet="/Logo.png 1x, /Logo.png 2x"
            alt="Mueblería Ramírez"
          />
          DCMR · Mueblería
        </Link>

        {}
        <button
          className="nav-toggle"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen(s => !s)}
        >
          <span /><span /><span />
        </button>

        {}
        <div
          className={`navlinks ${open ? 'open' : ''}`}
          onClick={(e) => {
            if (e.target.closest('a')) setOpen(false);
          }}
        >
          <Link className="btn" to="/">Inicio</Link>

          <div className="btn-outline" style={{padding:0}}>
            <select
              className="nav-select"
              value={currentCat}
              onChange={onChangeCat}
              aria-label="Categorías"
            >
              <option value="all">Categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {}
          <form className="nav-search" onSubmit={onSubmit} role="search">
            <input
              className="nav-search-input"
              placeholder="Buscar producto..."
              value={term}
              onChange={onChangeTerm}
              aria-label="Buscar producto"
            />
            <button className="nav-search-btn" type="submit">Buscar</button>
          </form>

          {user && isAdmin && <Link className="btn" to="/admin">Admin</Link>}
          {user && <Link className="btn" to="/mis-pedidos">Pedidos</Link>}

          <Link className="btn" to="/carrito">
            Carrito <span className="badge">{items.length}</span>
          </Link>

          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link className="btn" to="/login">Login</Link>
              <Link className="btn" to="/registro">Registro</Link>
            </>
          )}
        </div>
      </div>

      {}
      <MobileDrawer open={open} onClose={close} />
    </div>
  );
}
