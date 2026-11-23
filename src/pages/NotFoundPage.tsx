import { useNavigate } from "react-router";
import { EmptyState } from "@/components/shared/States";
import { useAuth } from "@/contexts/AuthContext";

export function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  return (
    <div className="product-shell boot-screen">
      <EmptyState
        icon="search"
        title="Página não encontrada"
        text="O endereço pode ter mudado ou o conteúdo foi removido."
        action={
          <button className="product-primary" onClick={() => navigate(isAuthenticated ? "/app/dashboard" : "/")}>
            {isAuthenticated ? "Ir para o dashboard" : "Voltar ao início"}
          </button>
        }
      />
    </div>
  );
}
