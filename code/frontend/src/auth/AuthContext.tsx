import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setUnauthorizedHandler, TOKEN_KEY } from "../api/client";
import type { Role, TokenResponse, User } from "../api/types";

interface AuthState {
  user: User | null;
  role: Role | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!localStorage.getItem(TOKEN_KEY));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Restore the session from a stored token.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api.get<User>("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<TokenResponse>("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setUser(data.user);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, role: user?.role ?? null, isAdmin: user?.role === "ADMIN", loading, login, logout }),
    [user, loading, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
