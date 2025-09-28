import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

const onlyDigits = (v) => v.replace(/\D/g, '');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const { show } = useToast();

  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    telefono: '',
    direccion: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Ingresa tu nombre';
    if (!isEmail(form.correo)) e.correo = 'Correo inválido (debe contener @ y dominio)';
    if ((form.contraseña || '').length < 6) e.contraseña = 'La contraseña debe tener al menos 6 caracteres';
    if (form.telefono && !/^\d+$/.test(form.telefono)) e.telefono = 'El teléfono sólo debe contener números';
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      setSubmitting(true);
      await register({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        contraseña: form.contraseña,
        telefono: form.telefono || null,
        direccion: form.direccion?.trim() || null
      });
      show('¡Registro Completado DCMR!', { type: 'success' });
      nav('/');
    } catch (err) {
      setErrors({ general: err?.response?.data?.error || 'No se pudo registrar' });
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page login-bg">
      <div className="auth-card">
        <h1 className="auth-title">Crear Cuenta</h1>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {errors.general && <p className="auth-error">{errors.general}</p>}

          <input
            className="auth-input"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e)=>setField('nombre', e.target.value)}
          />
          {errors.nombre && <small className="auth-error">{errors.nombre}</small>}

          <input
            className="auth-input"
            type="email"
            placeholder="Correo"
            value={form.correo}
            onChange={(e)=>setField('correo', e.target.value)}
          />
          {errors.correo && <small className="auth-error">{errors.correo}</small>}

          <input
            className="auth-input"
            type="password"
            placeholder="Contraseña"
            minLength={6}
            value={form.contraseña}
            onChange={(e)=>setField('contraseña', e.target.value)}
          />
          {errors.contraseña && <small className="auth-error">{errors.contraseña}</small>}

          <input
            className="auth-input"
            type="tel"
            inputMode="numeric"
            pattern="\d*"
            maxLength={15}
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e)=>setField('telefono', onlyDigits(e.target.value))}
          />
          {errors.telefono && <small className="auth-error">{errors.telefono}</small>}

          <textarea
            className="auth-input"
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e)=>setField('direccion', e.target.value)}
          />

          <button className="auth-btn" type="submit" disabled={submitting}>
            {submitting ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
          <Link to="/">Volver</Link>
        </div>
      </div>
    </div>
  );
}
