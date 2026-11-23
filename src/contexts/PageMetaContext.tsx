import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface PageMeta {
  eyebrow: string;
  title: string;
}

const PageMetaContext = createContext<{ meta: PageMeta; setMeta: (meta: PageMeta) => void } | null>(null);

export function PageMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<PageMeta>({ eyebrow: "", title: "" });
  return <PageMetaContext.Provider value={{ meta, setMeta }}>{children}</PageMetaContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePageMetaValue() {
  const ctx = useContext(PageMetaContext);
  if (!ctx) throw new Error("usePageMetaValue precisa estar dentro de <PageMetaProvider>.");
  return ctx.meta;
}

/** Define o título do cabeçalho do app e da aba do navegador para a página atual. */
// eslint-disable-next-line react-refresh/only-export-components
export function usePageMeta(eyebrow: string, title: string) {
  const ctx = useContext(PageMetaContext);
  const setMeta = ctx?.setMeta;
  useEffect(() => {
    setMeta?.({ eyebrow, title });
    document.title = title ? `${title} · Scenara` : "Scenara";
  }, [eyebrow, title, setMeta]);
}
