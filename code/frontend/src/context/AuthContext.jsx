import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, setUnauthorizedHandler, tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (tokenStore.get()) {
      authApi.me().then(setUser).catch(() => tokenStore.clear()).finally(() => setLoading(false));
    }
  }, [logout]);

  const accept = (data) => {
    tokenStore.set(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login: (email, password) => authApi.login({ email, password }).then(accept),
      register: (b) => authApi.register(b).then(accept),
      logout,
      setUser,
    }),
    [user, loading, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
