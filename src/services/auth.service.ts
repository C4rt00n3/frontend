import { api } from "./api";
import type { LoginRequest, LoginResponse, RegisterRequest, User } from "@/types/api";

export const authService = {
  async login(body: LoginRequest) {
    const { data } = await api.post<LoginResponse>("/auth/login", body);
    return data;
  },
  /** Encerra a sessão no servidor (Redis). Recebe o token explicitamente porque o local já foi limpo. */
  async logout(token: string) {
    await api.post("/auth/logout", null, { headers: { Authorization: `Bearer ${token}` } });
  },
  async register(body: RegisterRequest) {
    const { data } = await api.post<User>("/auth/cadastro", body);
    return data;
  },
};
