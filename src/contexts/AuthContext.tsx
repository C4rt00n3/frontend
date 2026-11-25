import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken, setAuthToken, setUnauthorizedHandler } from "@/services/api";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { keys } from "@/hooks/queries";
import type { LoginRequest, RegisterRequest, User } from "@/types/api";

interface AuthContextValue {
  user: User | undefined;
  isAuthenticated: boolean;
  /** true enquanto confirmamos, na abertura do app, se o token salvo ainda é válido. */
  isRestoring: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getAuthToken());

  const logout = useCallback(() => {
    const currentToken = getAuthToken();
    // Revoga a sessão no backend sem bloquear a saída: o estado local é limpo de qualquer forma.
    if (currentToken) authService.logout(currentToken).catch(() => {});
    setAuthToken(null);
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  // Token expirado ou inválido: qualquer 401 encerra a sessão e o ProtectedRoute leva ao login.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const me = useQuery({
    queryKey: keys.me,
    queryFn: userService.me,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const { token: newToken } = await authService.login(credentials);
      setAuthToken(newToken);
      queryClient.clear();
      setToken(newToken);
      // Carrega o usuário antes de navegar, para o layout já abrir com nome e e-mail.
      await queryClient.fetchQuery({ queryKey: keys.me, queryFn: userService.me });
    },
    [queryClient],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      await authService.register(data);
      await login({ email: data.email, password: data.password });
    },
    [login],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: me.data,
      isAuthenticated: !!token,
      isRestoring: !!token && me.isPending,
      login,
      register,
      logout,
    }),
    [me.data, me.isPending, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}
