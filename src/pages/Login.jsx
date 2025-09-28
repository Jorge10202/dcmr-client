import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const { show } = useToast();   
  const location = useLocation();                             
  const from = location.state?.from?.pathname || '/';    
  

  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false); 
 
  useEffect(() => {
    show('Ingresa con tu cuenta', { type: 'info' });}, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(correo, contraseña);
      show('¡Sesión iniciada!', { type: 'success' });
      nav(from, { replace: true }); 
    } catch (e) {
      setErr(e?.response?.data?.error || 'Usuario o contraseña inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-bg">
      <div className="auth-card">
        <h1 className="auth-title">DCMR</h1>

        <form className="auth-form" onSubmit={onSubmit}>
          {err && <p className="auth-error">{err}</p>}

          <input
            className="auth-input"
            placeholder="Usuario"
            aria-label="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <div className="auth-input-wrap">
            <input
              className="auth-input"
              type={showPwd ? 'text' : 'password'}
              placeholder="Contraseña"
              aria-label="Contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPwd((s) => !s)}
              aria-label="Mostrar/ocultar contraseña"
              title={showPwd ? 'Ocultar' : 'Mostrar contraseña'}
            >
              {showPwd ? '' : ''}
            </button>
          </div>

          <button className="auth-btn" type="submit">Login</button>
        </form>

        <div className="auth-links">
          <Link to="/recuperar">¿Perdiste tu contraseña?</Link>
          <Link to="/registro">¿No tienes Cuenta? Regístrate</Link>
          <Link to="/">Volver</Link>
        </div>
      </div>
    </div>
  );
}

