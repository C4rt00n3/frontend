import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Glyph } from "@/components/ui/Glyph";
import { ProjectRow } from "@/components/shared/ProjectRow";
import { EmptyState, ErrorState, Skeleton } from "@/components/shared/States";
import { usePageMeta } from "@/contexts/PageMetaContext";
import { useProjectsOverview } from "@/hooks/queries";
import type { ProjectStatus } from "@/types/api";

type StatusFilter = "ALL" | ProjectStatus;
type Sort = "updated" | "created" | "name";

export function ProjectsPage() {
  usePageMeta("PLANEJAMENTO", "Meus projetos");
  const navigate = useNavigate();
  const { projects, items } = useProjectsOverview();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<Sort>("updated");

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return items
      .filter((i) => status === "ALL" || i.project.status === status)
      .filter((i) => !term || i.project.name.toLocaleLowerCase("pt-BR").includes(term))
      .sort((a, b) => {
        if (sort === "name") return a.project.name.localeCompare(b.project.name, "pt-BR");
        if (sort === "created") return b.project.createdAt.localeCompare(a.project.createdAt);
        return b.project.updatedAt.localeCompare(a.project.updatedAt);
      });
  }, [items, search, status, sort]);

  return (
    <div className="product-page">
      <section className="page-title-row">
        <div>
          <h2>Todos os projetos</h2>
          <p>Organize decisões e acompanhe seus cenários financeiros.</p>
        </div>
        <button className="product-primary" onClick={() => navigate("/app/projects/new")}>
          <Glyph name="plus" /> Novo projeto
        </button>
      </section>
      <div className="list-toolbar">
        <label className="search-box">
          <Glyph name="search" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome do projeto..."
            aria-label="Buscar projetos"
          />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="Filtrar por status">
          <option value="ALL">Todos os status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="ARCHIVED">Arquivados</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordenar projetos">
          <option value="updated">Atualizados recentemente</option>
          <option value="created">Criados recentemente</option>
          <option value="name">Nome (A–Z)</option>
        </select>
      </div>
      <section className="surface-panel project-list">
        <div className="project-table-head">
          <span>PROJETO</span>
          <span>CENÁRIOS</span>
          <span>STATUS</span>
          <span>ATUALIZAÇÃO</span>
          <span />
        </div>
        {projects.isPending ? (
          <Skeleton height={220} />
        ) : projects.isError ? (
          <ErrorState error={projects.error} onRetry={() => projects.refetch()} />
        ) : filtered.length ? (
          filtered.map((i) => <ProjectRow key={i.project.id} project={i.project} scenarioCount={i.scenarioCount} />)
        ) : items.length ? (
          <EmptyState title="Nenhum projeto encontrado" text="Tente outro termo ou ajuste os filtros." icon="search" />
        ) : (
          <EmptyState
            title="Nenhum projeto ainda"
            text="Um projeto reúne a decisão que você quer analisar e os cenários que vão respondê-la."
            action={
              <button className="product-primary" onClick={() => navigate("/app/projects/new")}>
                <Glyph name="plus" /> Criar primeiro projeto
              </button>
            }
          />
        )}
      </section>
    </div>
  );
}
