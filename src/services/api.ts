import axios, { AxiosError } from "axios";

const TOKEN_KEY = "scenara.token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

// O token vive no localStorage; o acesso é protegido porque o navegador pode bloqueá-lo.
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* sem persistência: a sessão dura até recarregar a página */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nada a limpar */
    }
  },
};

let memoryToken: string | null = tokenStorage.get();
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  memoryToken = token;
  if (token) tokenStorage.set(token);
  else tokenStorage.clear();
}

export function getAuthToken() {
  return memoryToken;
}

/** Registrado pelo AuthProvider: chamado quando a API responde 401 numa requisição autenticada. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  if (memoryToken) config.headers.Authorization = `Bearer ${memoryToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && hadToken) onUnauthorized?.();
    return Promise.reject(error);
  },
);

interface SpringErrorBody {
  message?: string;
  error?: string;
  errors?: { field?: string; defaultMessage?: string }[];
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Revise os dados informados.",
  401: "E-mail ou senha inválidos.",
  403: "Você não tem permissão para esta ação.",
  404: "Não encontramos o que você procurava.",
  409: "Já existe um registro com esses dados.",
  500: "O servidor encontrou um erro. Tente novamente em instantes.",
};

/** Converte qualquer erro de requisição em uma mensagem legível em português. */
export function getErrorMessage(error: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : fallback;
  if (!error.response) {
    return error.code === "ECONNABORTED"
      ? "A API demorou para responder. Tente novamente."
      : "Não foi possível conectar à API. Verifique se o backend está em execução.";
  }
  const { status, data } = error.response as { status: number; data?: SpringErrorBody };
  if (data?.errors?.length) {
    return data.errors
      .map((e) => (e.field ? `${e.field}: ${e.defaultMessage ?? "inválido"}` : e.defaultMessage))
      .filter(Boolean)
      .join(" · ");
  }
  // Mensagens genéricas do Spring ("Not Found", "Bad Request") não ajudam o usuário.
  if (data?.message && data.message !== data.error && !/^[A-Z][a-z]+( [A-Z][a-z]+)*$/.test(data.message)) {
    return data.message;
  }
  return STATUS_MESSAGES[status] ?? fallback;
}

export function isNotFound(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}
