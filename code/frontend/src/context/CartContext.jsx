import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const EMPTY = { items: [], subtotal: '0.00', shipping: '0.00', tax: '0.00', total: '0.00', count: 0 };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY);

  const refresh = useCallback(() => {
    if (!user) return setCart(EMPTY);
    return cartApi.get().then(setCart).catch(() => {});
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo(
    () => ({
      cart,
      count: cart.count,
      refresh,
      add: (id, qty = 1) => cartApi.add(id, qty).then(setCart),
      update: (itemId, qty) => cartApi.update(itemId, qty).then(setCart),
      remove: (itemId) => cartApi.remove(itemId).then(setCart),
      clear: () => cartApi.clear().then(setCart),
    }),
    [cart, refresh]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
