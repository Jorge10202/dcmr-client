import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Profile() {
  const { user, saveProfile } = useAuth();
  const { show } = useToast();

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveProfile(form);
      show('Perfil actualizado', { type: 'success' });
    } catch (e) {
      show(e?.response?.data?.error || 'No se pudo actualizar', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{maxWidth: 740}}>
      <h2>Mi perfil</h2>
      <form className="form" onSubmit={onSubmit}>
        <label className="label">Nombre</label>
        <input className="input" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} />

        <label className="label">Teléfono</label>
        <input className="input" value={form.telefono} onChange={e=>setForm({...form, telefono:e.target.value})} />

        <label className="label">Dirección</label>
        <textarea className="input" value={form.direccion} onChange={e=>setForm({...form, direccion:e.target.value})} />

        <button className="btn" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
      </form>
    </div>
  );
}
