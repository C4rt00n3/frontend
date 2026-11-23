import type { ReactNode } from "react";
import { getErrorMessage, isNotFound } from "@/services/api";
import { Glyph, type GlyphName } from "@/components/ui/Glyph";

export function EmptyState({
  title,
  text,
  icon = "folder",
  action,
}: {
  title: string;
  text: string;
  icon?: GlyphName;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span>
        <Glyph name={icon} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  notFoundTitle = "Não encontrado",
}: {
  error: unknown;
  onRetry?: () => void;
  notFoundTitle?: string;
}) {
  const notFound = isNotFound(error);
  return (
    <div className="empty-state error-state" role="alert">
      <span>
        <Glyph name="alert" />
      </span>
      <h3>{notFound ? notFoundTitle : "Não foi possível carregar"}</h3>
      <p>{getErrorMessage(error)}</p>
      {onRetry && !notFound && (
        <div className="empty-state-action">
          <button className="product-secondary" onClick={onRetry}>
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}

/** Bloco reservado enquanto um painel carrega, para a página não "pular". */
export function Skeleton({ height = 80, className = "" }: { height?: number; className?: string }) {
  return <div className={`skeleton ${className}`} style={{ height }} aria-hidden="true" />;
}
