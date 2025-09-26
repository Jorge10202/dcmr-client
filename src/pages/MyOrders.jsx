import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import downloadInvoice from '../utils/downloadInvoice'; 

export default function MyOrders() {
  const { user } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState({}); 

  const labelStatus = (s) =>
    s === 'completado' ? 'entregado'
    : s === 'deposito' ? 'depósito bancario'
    : s;

  const WHATSAPP = '+502 5598-1317';

  useEffect(() => {
    if (!user) {
      show('Inicia sesión para ver tus pedidos', {
        type: 'warning',
        actionText: 'Ir a Login',
        onAction: () => navigate('/login')
      });
      return;
    }
    (async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        show('No se pudieron cargar tus pedidos', { type: 'error' });
      }
    })();
  }, [user]);

  if (!user) return null;

  const onDownload = async (orderId) => {
    try {
      await downloadInvoice(orderId);
    } catch (e) {
      console.error(e);
      show('No se pudo descargar el comprobante', { type: 'error' });
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mis pedidos</h1>
        <p>Historial de compras de {user?.nombre}</p>
      </div>

      {orders.length === 0 && (
        <p style={{marginTop:'1rem'}}>Aún no tienes pedidos.</p>
      )}

      <div style={{display:'grid', gap:'12px', marginTop:'12px'}}>
        {orders.map(o => (
          <div key={o.id} className="order-card">
            <div
              className="order-header"
              onClick={()=>setOpen(s=>({...s, [o.id]: !s[o.id]}))}
              style={{cursor:'pointer'}}
            >
              <div style={{display:'grid'}}>
                <strong>Pedido</strong>
                <small>{new Date(o.created_at).toLocaleString()}</small>
              </div>
              <div style={{display:'flex', gap:10, alignItems:'center'}}>
                <span className={`chip status-${o.status}`}>{labelStatus(o.status)}</span>
                <strong>Q {Number(o.total).toFixed(2)}</strong>
                <button
                  className="btn"
                  style={{padding:'.35rem .6rem'}}
                  onClick={(e)=>{ e.stopPropagation(); onDownload(o.id); }}
                  title="Descargar comprobante (PDF)"
                >
                  PDF
                </button>
                <button className="btn" style={{padding:'.35rem .6rem'}}>Ver</button>
              </div>
            </div>

            {open[o.id] && (
              <div className="order-body">
                {o.status === 'deposito' && (
                  <div
                    className="alert"
                    style={{
                      background:'#FFF7E6',
                      border:'1px solid #F59F00',
                      color:'#7A5200',
                      padding:'10px 12px',
                      borderRadius:8,
                      marginBottom:10
                    }}
                  >
                    <strong>Método: Depósito bancario.</strong> Revisa tu correo: te enviamos los datos de la cuenta bancaria.
                    Cuando realices el depósito, envía tu comprobante por WhatsApp al <b>{WHATSAPP}</b>.
                    Al verificarlo, tu pedido pasará a <b>Entregado</b>.
                  </div>
                )}

                <div className="table-wrap">
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
                      {(o.items || []).map(it => (
                        <tr key={`${o.id}-${it.product_id}`}>
                          <td>{it.nombre}</td>
                          <td>{it.quantity}</td>
                          <td>Q {Number(it.unit_price).toFixed(2)}</td>
                          <td>Q {(Number(it.unit_price) * it.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
