import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const ConfirmCtx = createContext(null);
export const useConfirm = () => useContext(ConfirmCtx);

export function ConfirmProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState({
    title: 'Confirmar',
    message: '¿Estás seguro?',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    type: 'warning',           
    dismissOnBackdrop: true
  });
  const resolver = useRef(null);

  const confirm = (o = {}) =>
    new Promise((resolve) => {
      setOpts((prev) => ({ ...prev, ...o }));
      resolver.current = resolve;
      setOpen(true);
    });

  const close = (answer = false) => {
    setOpen(false);
    resolver.current?.(answer);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <ConfirmCtx.Provider value={{ confirm }}>
      {children}
      {open && (
        <div
          className="confirm-backdrop"
          onClick={() => opts.dismissOnBackdrop !== false && close(false)}
        >
          <div
            className={`confirm-modal ${opts.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-header">{opts.title}</div>
            <div className="confirm-body">{opts.message}</div>
            <div className="confirm-actions">
              <button className="btn-outline" onClick={() => close(false)}>
                {opts.cancelText || 'Cancelar'}
              </button>
              <button className="btn" onClick={() => close(true)}>
                {opts.confirmText || 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
