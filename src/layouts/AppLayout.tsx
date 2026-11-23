import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProductHeader } from "@/components/layout/ProductHeader";
import { PageMetaProvider } from "@/contexts/PageMetaContext";

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname, hash } = useLocation();

  // Nova página: volta ao topo, ou rola até a âncora (#cenarios) quando houver.
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 150);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <PageMetaProvider>
      <div className="product-shell">
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Sidebar open={menuOpen} close={() => setMenuOpen(false)} />
        <div className="product-main">
          <ProductHeader openMenu={() => setMenuOpen(true)} />
          <main id="conteudo">
            <Outlet />
          </main>
        </div>
      </div>
    </PageMetaProvider>
  );
}
