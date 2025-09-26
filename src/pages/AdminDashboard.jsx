import React, { useEffect, useState } from 'react';
import api from '../api';
import { useConfirm } from '../components/Confirm.jsx';
import { useToast } from '../components/Toast.jsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import downloadInvoice  from '../utils/downloadInvoice.js';

export default function AdminDashboard() {
  const [tab, setTab] = useState('productos');
  const [cats, setCats] = useState([]);
  const [prods, setProds] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ masVendidos: [], masCotizados: [], masVistos: [], timeline: [] });
  const [range, setRange] = useState('month'); 
  const { confirm } = useConfirm();
  const { show } = useToast();

  const loadAll = async () => {
    const [{ data: catsD }, { data: prodsD }, { data: usersD }, { data: ordersD }, { data: statsD }] = await Promise.all([
      api.get('/categories'),
      api.get('/products'),
      api.get('/admin/users'),
      api.get('/admin/orders'),
      api.get('/admin/stats', { params: { range } }) 
    ]);
    setCats(catsD);
    setProds(prodsD);
    setUsers(usersD);
    setOrders(ordersD);
    setStats(statsD || {});
  };

  useEffect(() => { loadAll(); }, []);      
  useEffect(() => { loadAll(); }, [range]); 

  const [formP, setFormP] = useState({
    nombre: '',
    precio: '',
    stock: 0,
    descripcion: '',
    imagen1: '',
    imagen2: '',
    id_categoria: ''
  });

  const [uploading, setUploading] = useState({ imagen1: false, imagen2: false });
  const handleUpload = async (field, file) => {
    if (!file) return;
    setUploading((u) => ({ ...u, [field]: true }));
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormP((fp) => ({ ...fp, [field]: data.url }));
    } catch (e) {
      alert('Error al subir imagen');
      console.error(e);
    } finally {
      setUploading((u) => ({ ...u, [field]: false }));
    }
  };

  const createProduct = async () => {
    await api.post('/products', { ...formP, precio: Number(formP.precio), stock: Number(formP.stock) });
    setFormP({ nombre: '', precio: '', stock: 0, descripcion: '', imagen1: '', imagen2: '', id_categoria: '' });
    loadAll();
    show('Producto creado correctamente', { type: 'success' });
  };

  const deleteProduct = async (id) => {
    const ok = await confirm({
      title: 'Eliminar producto',
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    if (!ok) return;
    await api.delete(`/products/${id}`);
    loadAll();
  };

  // --------- Edición de productos ---------
  const [editP, setEditP] = useState(null);

  const startEditP = (p) =>
    setEditP({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      descripcion: p.descripcion || '',
      imagen1: p.imagen1 || '',
      imagen2: p.imagen2 || '',
      id_categoria: p.id_categoria ?? ''
    });

  const cancelEditP = () => setEditP(null);

  const saveEditP = async () => {
    try {
      const { id, ...payload } = editP;
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '') payload[k] = null;
        if (k === 'precio' || k === 'stock') payload[k] = Number(payload[k]);
      });
      await api.put(`/products/${id}`, payload);
      setEditP(null);
      show('Producto actualizado', { type: 'success' });
      loadAll();
    } catch (e) {
      console.error(e);
      show('No se pudo actualizar el producto', { type: 'danger' });
    }
  };

  // --------- Categorías (crear / eliminar / editar) ---------
  const [formC, setFormC] = useState({ nombre: '', descripcion: '' });
  const createCat = async () => {
    await api.post('/categories', formC);
    setFormC({ nombre: '', descripcion: '' });
    loadAll();
    show('Categoría creada correctamente', { type: 'success' });
  };

  const deleteCat = async (id) => {
    const ok = await confirm({
      title: 'Eliminar categoría',
      message: '¿Seguro que deseas eliminarla?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    if (!ok) return;
    await api.delete(`/categories/${id}`);
    loadAll();
  };

  const [editC, setEditC] = useState(null);
  const startEditC = (c) => setEditC({ id: c.id, nombre: c.nombre, descripcion: c.descripcion || '' });
  const cancelEditC = () => setEditC(null);
  const saveEditC = async () => {
    try {
      const { id, ...payload } = editC;
      await api.put(`/categories/${id}`, payload);
      setEditC(null);
      show('Categoría actualizada', { type: 'success' });
      loadAll();
    } catch (e) {
      console.error(e);
      show('No se pudo actualizar la categoría', { type: 'danger' });
    }
  };

  // --------- Pedidos ---------
  const [openOrder, setOpenOrder] = useState({});

  const labelStatus = (s) =>
    s === 'completado' ? 'entregado' :
    s === 'deposito'   ? 'depósito bancario' :
    s;

  const setDelivered = async (id) => {
    const ok = await confirm({
      title: 'Confirmar entrega',
      message: '¿Marcar este pedido como ENTREGADO?',
      confirmText: 'Sí, marcar entregado',
      cancelText: 'Cancelar',
      type: 'warning'
    });
    if (!ok) return;

    try {
      await api.put(`/admin/orders/${id}/status`, { status: 'completado' });
      setOrders((prev) => prev.map(o => o.id === id ? { ...o, status: 'completado' } : o));
      const { data: statsD } = await api.get('/admin/stats', { params: { range } });
      setStats(statsD || {});
      show('Pedido marcado como entregado', { type: 'success' });
    } catch (e) {
      console.error(e);
      show('No se pudo marcar como entregado', { type: 'error' });
    }
  };

  // --------- Descuentos ---------
  const [formDisc, setFormDisc] = useState({
    product_id: '',
    pct: '',
    start: '',
    end: ''
  });

  const applyDisc = async () => {
    try {
      if (!formDisc.product_id || !formDisc.pct) {
        show('Selecciona producto y porcentaje', { type: 'warning' });
        return;
      }
      await api.post('/admin/discounts', {
        product_id: Number(formDisc.product_id),
        pct: Number(formDisc.pct),
        start: formDisc.start || null,
        end: formDisc.end || null
      });
      setFormDisc({ product_id: '', pct: '', start: '', end: '' });
      await loadAll();
      show('Descuento aplicado', { type: 'success' });
      setTab('descuentos');
    } catch (e) {
      console.error(e);
      show('No se pudo aplicar el descuento', { type: 'error' });
    }
  };

  const removeDisc = async (productId) => {
    const ok = await confirm({
      title: 'Quitar descuento',
      message: '¿Deseas quitar el descuento de este producto?',
      type: 'warning',
      confirmText: 'Sí, quitar',
      cancelText: 'Cancelar'
    });
    if (!ok) return;

    try {
      await api.delete(`/admin/discounts/${productId}`);
      await loadAll();
      show('Descuento quitado', { type: 'success' });
    } catch (e) {
      console.error(e);
      show('No se pudo quitar el descuento', { type: 'error' });
    }
  };

  // --------- Datos gráficas ---------
  const vendData = Array.isArray(stats?.masVendidos)
    ? stats.masVendidos.map((s) => ({ name: s.nombre, cantidad: Number(s.vendidos || 0) }))
    : [];
  const cotData = Array.isArray(stats?.masCotizados)
    ? stats.masCotizados.map((s) => ({ name: s.nombre, cantidad: Number(s.cotizaciones || 0) }))
    : [];
  const visData = Array.isArray(stats?.masVistos)
    ? stats.masVistos.map((s) => ({ name: s.nombre, cantidad: Number(s.vistas || 0) }))
    : [];

  const timeline = Array.isArray(stats?.timeline)
    ? stats.timeline.map((r) => ({
        name: r.label,
        entregados: Number(r.entregados || 0),
        no_entregados: Number(r.no_entregados || 0)
      }))
    : [];
  
  const favData = Array.isArray(stats?.masFavoritos)
  ? stats.masFavoritos.map(s => ({ name: s.nombre, cantidad: Number(s.favoritos || 0) }))
  : [];

  const deliveredOnly = timeline.map(t => ({ name: t.name, cantidad: t.entregados }));
  const pendingOnly   = timeline.map(t => ({ name: t.name, cantidad: t.no_entregados }));

  return (
    <div className="container admin-page">
      <h2>Panel Administrador</h2>

      {}
      <div className="tabs-scroller">
        {['productos', 'categorias', 'usuarios', 'pedidos', 'estadisticas', 'descuentos'].map((t) => (
          <button
            key={t}
            className={`btn ${tab === t ? '' : 'btn-outline'}`}
            style={{ color: '#000' }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'productos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>
          <div className="form">
            <h3>Nuevo producto</h3>
            <label className="label">Nombre</label>
            <input className="input" value={formP.nombre} onChange={(e) => setFormP({ ...formP, nombre: e.target.value })} />
            <label className="label">Precio</label>
            <input
              className="input"
              type="number"
              value={formP.precio}
              onChange={(e) => setFormP({ ...formP, precio: e.target.value })}
            />
            <label className="label">Stock</label>
            <input
              className="input"
              type="number"
              value={formP.stock}
              onChange={(e) => setFormP({ ...formP, stock: e.target.value })}
            />
            <label className="label">Descripción</label>
            <textarea
              className="input"
              value={formP.descripcion}
              onChange={(e) => setFormP({ ...formP, descripcion: e.target.value })}
            />

            <label className="label">Imagen 1 (URL o archivo)</label>
            <input
              className="input"
              placeholder="https://..."
              value={formP.imagen1}
              onChange={(e) => setFormP({ ...formP, imagen1: e.target.value })}
            />
            <input type="file" accept="image/*" onChange={(e) => handleUpload('imagen1', e.target.files[0])} />
            {uploading.imagen1 && <small>Subiendo imagen 1...</small>}

            <label className="label">Imagen 2 (URL o archivo)</label>
            <input
              className="input"
              placeholder="https://..."
              value={formP.imagen2}
              onChange={(e) => setFormP({ ...formP, imagen2: e.target.value })}
            />
            <input type="file" accept="image/*" onChange={(e) => handleUpload('imagen2', e.target.files[0])} />
            {uploading.imagen2 && <small>Subiendo imagen 2...</small>}

            <label className="label">Categoría</label>
            <select
              className="input"
              value={formP.id_categoria}
              onChange={(e) => setFormP({ ...formP, id_categoria: e.target.value })}
            >
              <option value="">Seleccione</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <button className="btn" onClick={createProduct}>
              Crear
            </button>
          </div>

          <div>
            {}
            <div className="table-wrap admin-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Categoría</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {prods.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>

                      {/* Nombre */}
                      <td>
                        {editP?.id === p.id ? (
                          <input
                            className="input"
                            value={editP.nombre}
                            onChange={(e) => setEditP({ ...editP, nombre: e.target.value })}
                          />
                        ) : (
                          p.nombre
                        )}
                      </td>

                      {/* Precio */}
                      <td>
                        {editP?.id === p.id ? (
                          <input
                            className="input"
                            type="number"
                            value={editP.precio}
                            onChange={(e) => setEditP({ ...editP, precio: e.target.value })}
                          />
                        ) : (
                          `Q ${Number(p.precio).toFixed(2)}`
                        )}
                      </td>

                      {/* Stock */}
                      <td>
                        {editP?.id === p.id ? (
                          <input
                            className="input"
                            type="number"
                            value={editP.stock}
                            onChange={(e) => setEditP({ ...editP, stock: e.target.value })}
                          />
                        ) : (
                          <span>{p.stock}</span>
                        )}
                      </td>

                      {/* Categoría */}
                      <td>
                        {editP?.id === p.id ? (
                          <select
                            className="input"
                            value={editP.id_categoria ?? ''}
                            onChange={(e) => setEditP({ ...editP, id_categoria: e.target.value })}
                          >
                            <option value="">(sin categoría)</option>
                            {cats.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nombre}
                              </option>
                            ))}
                          </select>
                        ) : (
                          p.categoria_nombre || '-'
                        )}
                      </td>

                      <td style={{ display: 'flex', gap: 8 }}>
                        {editP?.id === p.id ? (
                          <>
                            <button className="btn" onClick={saveEditP}>
                              Guardar
                            </button>
                            <button className="btn btn-outline" onClick={cancelEditP}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn" onClick={() => startEditP(p)}>
                              Editar
                            </button>
                            <button className="btn btn-outline" style={{ color: '#000' }} onClick={() => deleteProduct(p.id)}>
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {}
          </div>
        </div>
      )}

      {tab === 'categorias' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
          <div className="form">
            <h3>Nueva categoría</h3>
            <label className="label">Nombre</label>
            <input className="input" value={formC.nombre} onChange={(e) => setFormC({ ...formC, nombre: e.target.value })} />
            <label className="label">Descripción</label>
            <textarea
              className="input"
              value={formC.descripcion}
              onChange={(e) => setFormC({ ...formC, descripcion: e.target.value })}
            />
            <button className="btn" onClick={createCat}>
              Crear
            </button>
          </div>

          <div>
            {}
            <div className="table-wrap admin-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cats.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>

                      <td>
                        {editC?.id === c.id ? (
                          <input
                            className="input"
                            value={editC.nombre}
                            onChange={(e) => setEditC({ ...editC, nombre: e.target.value })}
                          />
                        ) : (
                          c.nombre
                        )}
                      </td>

                      <td>
                        {editC?.id === c.id ? (
                          <input
                            className="input"
                            value={editC.descripcion}
                            onChange={(e) => setEditC({ ...editC, descripcion: e.target.value })}
                          />
                        ) : (
                          c.descripcion || ''
                        )}
                      </td>

                      <td style={{ display: 'flex', gap: 8 }}>
                        {editC?.id === c.id ? (
                          <>
                            <button className="btn" onClick={saveEditC}>
                              Guardar
                            </button>
                            <button className="btn btn-outline" onClick={cancelEditC}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn" onClick={() => startEditC(c)}>
                              Editar
                            </button>
                            <button className="btn btn-outline" style={{ color: '#000' }} onClick={() => deleteCat(c.id)}>
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {}
          </div>
        </div>
      )}

      {tab === 'usuarios' && (
        <div>
          {}
          <div className="table-wrap admin-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Rol</th>
                  <th>Fecha y Hora</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.correo}</td>
                    <td>{u.telefono || ''}</td>
                    <td>{u.direccion || ''}</td>
                    <td>{u.rol}</td>
                    <td>{new Date(u.creado_en).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {}
        </div>
      )}

      {tab === 'pedidos' && (
        <div>
          {}
          <div className="table-wrap admin-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <React.Fragment key={o.id}>
                    <tr>
                      <td>{o.id}</td>
                      <td>{o.usuario_nombre || o.user_id}</td>
                      <td>Q {Number(o.total).toFixed(2)}</td>
                      <td>
                        <span className={`chip status-${o.status}`}>{labelStatus(o.status)}</span>
                      </td>
                      <td>{new Date(o.created_at).toLocaleString()}</td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn"
                          onClick={() => setOpenOrder((s) => ({ ...s, [o.id]: !s[o.id] }))}>
                          {openOrder[o.id] ? 'Ocultar' : 'Ver detalle'}
                        </button>

                        {/* PDF */}
                        <button
                          className="btn"
                          onClick={() => downloadInvoice(o.id)}>
                          Comprobante
                        </button>

                        {o.status !== 'completado' && (
                          <button className="btn" onClick={() => setDelivered(o.id)}>
                            Marcar entregado
                          </button>
                        )}
                      </td>

                    </tr>

                    {openOrder[o.id] && (
                      <tr>
                        <td colSpan="6">
                          <div style={{ padding: '8px 6px' }}>
                            <strong>Productos</strong>
                            {}
                            <div className="table-wrap" style={{ marginTop: 6 }}>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(o.items || []).map((it) => (
                                    <tr key={it.id}>
                                      <td>{it.nombre}</td>
                                      <td>{it.quantity}</td>
                                      <td>Q {Number(it.unit_price).toFixed(2)}</td>
                                      <td>Q {(Number(it.unit_price) * it.quantity).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {}
        </div>
      )}

      {tab === 'estadisticas' && (
        <>
          {}
          <div style={{ display:'flex', gap:8, margin:'6px 0 14px' }}>
            <button className={`btn ${range==='week' ? '' : 'btn-outline'}`} onClick={() => setRange('week')}>Semana</button>
            <button className={`btn ${range==='month' ? '' : 'btn-outline'}`} onClick={() => setRange('month')}>Mes</button>
            <button className={`btn ${range==='year' ? '' : 'btn-outline'}`} onClick={() => setRange('year')}>Año</button>
          </div>

          {}
          <div className="charts-grid" style={{ gridTemplateColumns:'1fr', marginBottom: 16 }}>
            <div className="chart-card">
              <h3>Pedidos por período (entregados vs no entregados)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeline} margin={{ top: 10, right: 8, left: 0, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="entregados" fill="#2FB344" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="no_entregados" fill="#F59F00" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {}
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Más vendidos</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={vendData} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-8} textAnchor="end" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#f0b400" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Más cotizados (agregados al carrito)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cotData} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-8} textAnchor="end" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#8b5e3c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Más vistos</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={visData} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-8} textAnchor="end" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#f7d154" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3>Más favoritos</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={favData} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-8} textAnchor="end" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#e63946" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {}
          <div className="charts-grid" style={{ marginTop: 16 }}>
            <div className="chart-card">
              <h3>Solo entregados</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deliveredOnly} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#2FB344" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>No entregados</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pendingOnly} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#F59F00" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {tab === 'descuentos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16 }}>
          {}
          <div className="form">
            <h3>Aplicar descuento</h3>

            <label className="label">Producto</label>
            <select
              className="input"
              value={formDisc.product_id}
              onChange={(e)=>setFormDisc(s=>({ ...s, product_id: e.target.value }))}
            >
              <option value="">Seleccione</option>
              {prods.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — Q {Number(p.precio).toFixed(2)}
                </option>
              ))}
            </select>

            <label className="label">% de descuento</label>
            <input
              className="input"
              type="number"
              placeholder="Ej. 15"
              min="1"
              max="99"
              value={formDisc.pct}
              onChange={(e)=>setFormDisc(s=>({ ...s, pct: e.target.value }))}
            />

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Desde (opcional)</label>
              <input
                type="datetime-local"
                className="input"
                value={formDisc.start}
                onChange={(e)=>setFormDisc(s=>({ ...s, end: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label className="label">Hasta (opcional)</label>
              <input
                type="datetime-local"
                className="input"
                value={formDisc.end}              
               onChange={(e)=>setFormDisc(s=>({ ...s, end: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

            <button className="btn" onClick={applyDisc}>
              Aplicar descuento
            </button>

            <small style={{color:'#555', display:'block', marginTop:8}}>
              Si no defines fechas, el descuento queda activo hasta que lo quites.
            </small>
          </div>

          {}
          <div>
            <div className="table-wrap admin-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>%</th>
                    <th>Desde</th>
                    <th>Hasta</th>
                    <th>Precio</th>
                    <th>Precio con desc.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {prods
                    .filter(p => p.descuento_pct != null)
                    .map(p => {
                      const pct = Number(p.descuento_pct || 0);
                      const final = Number(p.precio) * (1 - pct/100);
                      return (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.nombre}</td>
                          <td>{pct}%</td>
                          <td>{p.promo_inicio ? new Date(p.promo_inicio).toLocaleString() : '-'}</td>
                          <td>{p.promo_fin ? new Date(p.promo_fin).toLocaleString() : '-'}</td>
                          <td>Q {Number(p.precio).toFixed(2)}</td>
                          <td><strong>Q {final.toFixed(2)}</strong></td>
                          <td>
                            <button className="btn btn-outline" onClick={()=>removeDisc(p.id)}>
                              Quitar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
