import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  const icon = { success: <CheckCircle2 className="h-5 w-5 text-green-600" />, error: <XCircle className="h-5 w-5 text-red-600" />, info: <Info className="h-5 w-5 text-blue-600" /> };
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="card flex items-start gap-3 p-3 text-sm shadow-lg">
            {icon[t.type]}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
