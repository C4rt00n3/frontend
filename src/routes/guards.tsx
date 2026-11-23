import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/shared/States";

/** Rotas privadas: sem sessão, leva ao login e volta para a página pedida depois. */
export function ProtectedRoute() {
  const { isAuthenticated, isRestoring } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (isRestoring) {
    return (
      <div className="product-shell boot-screen">
        <LoadingState label="Abrindo seu espaço…" />
      </div>
    );
  }
  return <Outlet />;
}

/** Login e cadastro: quem já está autenticado vai para o app (ou para a página que tentava abrir). */
export function GuestRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  if (isAuthenticated) return <Navigate to={from?.startsWith("/app") ? from : "/app/dashboard"} replace />;
  return <Outlet />;
}
