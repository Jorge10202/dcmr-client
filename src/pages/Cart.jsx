import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useToast } from '../components/Toast.jsx';
import api from '../api'; 

export default function Cart() {
  const { items, updateQty, remove, checkout } = useCart();
  const { show } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingDep, setLoadingDep] = useState(false); 

  const total = useMemo(
    () => items.reduce((s, it) => s + Number(it.price_snapshot) * it.quantity, 0),
    [items]
  );

  const inc = (it) => updateQty(it.id, it.quantity + 1);
  const dec = (it) => updateQty(it.id, Math.max(1, it.quantity - 1));

  const onCheckout = async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const data = await checkout(); 
      show('¡Pedido realizado!', {
        type: 'success',
        actionText: 'Ver pedidos',
        onAction: () => navigate('/mis-pedidos'),
        duration: 4000
      });
      navigate('/mis-pedidos');
    } catch (e) {
      show(e?.response?.data?.error || 'No se pudo completar el pedido', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onCheckoutDeposit = async () => {
    if (!items.length) return;
    setLoadingDep(true);
    try {
      const { data } = await api.post('/orders/checkout-deposit');
      show(
        'Pedido registrado como depósito. Te enviamos un correo con la cuenta bancaria y las instrucciones.',
        {
          type: 'success',
          actionText: 'Ver pedidos',
          onAction: () => navigate('/mis-pedidos'),
          duration: 6000
        }
      );
      navigate('/mis-pedidos');
    } catch (e) {
      show(
        e?.response?.data?.error || 'No se pudo registrar el pedido con depósito bancario',
        { type: 'error' }
      );
    } finally {
      setLoadingDep(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Carrito</h1>
      </div>

      {items.length === 0 ? (
        <p style={{ marginTop: '1rem' }}>Tu carrito está vacío.</p>
      ) : (
        <>
          {}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img
                        src={
                          it.imagen1 ||
                          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format'
                        }
                        alt={it.nombre || `Producto ${it.product_id}`}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                      />
                      {it.nombre || `#${it.product_id}`}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button className="btn" onClick={() => dec(it)}>-</button>
                        <span>{it.quantity}</span>
                        <button className="btn" onClick={() => inc(it)}>+</button>
                      </div>
                    </td>
                    <td>Q {Number(it.price_snapshot).toFixed(2)}</td>
                    <td>Q {(Number(it.price_snapshot) * it.quantity).toFixed(2)}</td>
                    <td>
                      <button className="btn" onClick={() => remove(it.id)}>Quitar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              marginTop: 12,
              alignItems: 'center',
              flexWrap: 'wrap' 
            }}
          >
            <strong style={{ fontSize: '1.1rem' }}>Total: Q {total.toFixed(2)}</strong>

            {}
            <button
              className="btn btn-outline"
              style={{ color: '#000' }} 
              disabled={loadingDep || items.length === 0}
              onClick={onCheckoutDeposit}
              title="Registrar pedido y recibir por correo los datos bancarios"
            >
              {loadingDep ? 'Procesando...' : 'Pagar con depósito bancario'}
            </button>

            {}
            <button className="btn" disabled={loading || items.length === 0} onClick={onCheckout}>
              {loading ? 'Procesando...' : 'Pago Contra Entrega'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
