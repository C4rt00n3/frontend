import { useLocation, useNavigate } from "react-router";
import { Glyph } from "@/components/ui/Glyph";
import { ProductLogo } from "@/components/ui/ProductLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { initials } from "@/utils/format";

export function Sidebar({ open, close }: { open: boolean; close: () => void }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { user, logout } = useAuth();
  const { projectId, scenarioId, projectCount } = useCurrentProject();

  const go = (to: string) => {
    navigate(to);
    close();
  };

  const inProjects = pathname.startsWith("/app/projects");
  const isCompare = pathname.endsWith("/compare");
  const isSimulations = pathname.includes("/simulations") || search.includes("tab=history");
  const isScenarios = pathname.includes("/scenarios") && !isSimulations;
  const isProjects = inProjects && !isCompare && !isSimulations && !isScenarios;

  const projectBase = projectId ? `/app/projects/${projectId}` : null;
  const noProject = "Crie um projeto para acessar";

  return (
    <>
      {open && <button className="sidebar-overlay" onClick={close} aria-label="Fechar navegação" />}
      <aside className={`product-sidebar ${open ? "open" : ""}`} aria-label="Navegação do aplicativo">
        <div className="sidebar-logo">
          <ProductLogo to="/app/dashboard" />
          <button className="mobile-close" onClick={close} aria-label="Fechar navegação">
            <Glyph name="close" />
          </button>
        </div>
        <div className="workspace-switch">
          <span>{initials(user?.name)}</span>
          <div>
            <small>ESPAÇO DE TRABALHO</small>
            <strong>Pessoal</strong>
          </div>
        </div>
        <nav>
          <span className="nav-section">VISÃO GERAL</span>
          <button className={pathname === "/app/dashboard" ? "active" : ""} onClick={() => go("/app/dashboard")}>
            <Glyph name="home" /> Dashboard
          </button>
          <span className="nav-section">PLANEJAMENTO</span>
          <button className={isProjects ? "active" : ""} onClick={() => go("/app/projects")}>
            <Glyph name="folder" /> Projetos {projectCount != null && <em>{projectCount}</em>}
          </button>
          <button
            className={isScenarios ? "active" : ""}
            disabled={!projectBase}
            title={projectBase ? undefined : noProject}
            onClick={() => projectBase && go(`${projectBase}#cenarios`)}
          >
            <Glyph name="branch" /> Cenários
          </button>
          <button
            className={isSimulations ? "active" : ""}
            disabled={!projectBase}
            title={projectBase ? undefined : noProject}
            onClick={() =>
              projectBase &&
              go(scenarioId ? `${projectBase}/scenarios/${scenarioId}/simulations` : `${projectBase}?tab=history`)
            }
          >
            <Glyph name="chart" /> Simulações
          </button>
          <button
            className={isCompare ? "active" : ""}
            disabled={!projectBase}
            title={projectBase ? undefined : noProject}
            onClick={() => projectBase && go(`${projectBase}/compare`)}
          >
            <Glyph name="spark" /> Comparar
          </button>
          <span className="nav-section">CONTA</span>
          <button className={pathname === "/app/settings" ? "active" : ""} onClick={() => go("/app/settings")}>
            <Glyph name="settings" /> Configurações
          </button>
        </nav>
        <button className="sidebar-create" onClick={() => go("/app/projects/new")}>
          <Glyph name="plus" /> Novo projeto
        </button>
        <div className="sidebar-profile">
          <span>{initials(user?.name)}</span>
          <div>
            <strong>{user?.name ?? "…"}</strong>
            <small>{user?.email ?? ""}</small>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            aria-label="Sair"
            title="Sair"
          >
            <Glyph name="logout" />
          </button>
        </div>
      </aside>
    </>
  );
}
