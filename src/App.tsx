import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import axios from "axios";
import { AuthProvider } from "@/contexts/AuthContext";
import { router } from "@/routes/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Não insiste em erros do cliente (404, 401, 403): só em falhas de rede ou do servidor.
      retry: (count, error) => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status && status < 500) return false;
        return count < 2;
      },
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster theme="dark" position="bottom-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
