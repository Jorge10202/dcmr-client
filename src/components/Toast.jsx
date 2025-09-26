import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, opts = {}) => {
    const id = crypto.randomUUID();
    const toast = {
      id,
      message,
      type: opts.type || 'info',     
      actionText: opts.actionText,
      onAction: opts.onAction,
      duration: opts.duration ?? 3500,
    };
    setToasts(t => [...t, toast]);
    if (toast.duration > 0) {
      setTimeout(() => {
        setToasts(t => t.filter(x => x.id !== id));
      }, toast.duration);
    }
  }, []);

  const close = (id) => setToasts(t => t.filter(x => x.id !== id));

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="toast-msg">{t.message}</div>
            {t.actionText && (
              <button
                className="toast-action"
                onClick={() => { t.onAction?.(); close(t.id); }}
              >
                {t.actionText}
              </button>
            )}
            <button className="toast-x" onClick={() => close(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
