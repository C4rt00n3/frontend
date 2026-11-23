import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Glyph, type GlyphName } from "@/components/ui/Glyph";
import { ActivityChart } from "@/components/charts/FinancialCharts";
import { ProjectRow } from "@/components/shared/ProjectRow";
import { EmptyState, ErrorState, Skeleton } from "@/components/shared/States";
import { useAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/contexts/PageMetaContext";
import { useProjectsOverview } from "@/hooks/queries";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import type { SimulationSummary } from "@/types/api";
import { formatRelative, greeting } from "@/utils/format";

function StatCard({ label, value, note, icon }: { label: string; value: string; note: string; icon: GlyphName }) {
  return (
    <article className="stat-card">
      <div>
        <span>{label}</span>
        <div className="stat-icon">
          <Glyph name={icon} />
        </div>
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "short" });

/** Conta as simulações dos últimos 6 meses (incluindo o atual), mês a mês. */
function activityByMonth(simulations: SimulationSummary[], now = new Date()) {
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = simulations.filter((s) => {
      const d = new Date(s.executedAt);
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
    }).length;
    return { label: monthLabel.format(date).replace(".", "").toUpperCase(), count };
  });
}

export function DashboardPage() {
  usePageMeta("VISÃO GERAL", "Dashboard");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projectId } = useCurrentProject();
  const { projects, items, detailsLoading } = useProjectsOverview();
  // Data de referência fixada na montagem: a renderização não pode depender do relógio.
  const [now] = useState(() => new Date());

  const stats = useMemo(() => {
    const simulations = items.flatMap((i) => i.simulations ?? []);
    const sorted = [...simulations].sort((a, b) => b.executedAt.localeCompare(a.executedAt));
    const monthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    return {
      projects: items.length,
      active: items.filter((i) => i.project.status === "ACTIVE").length,
      scenarios: items.reduce((sum, i) => sum + (i.scenarioCount ?? 0), 0),
      projectsWithScenarios: items.filter((i) => (i.scenarioCount ?? 0) > 0).length,
      simulations: simulations.length,
      recentSimulations: simulations.filter((s) => new Date(s.executedAt).getTime() >= monthAgo).length,
      last: sorted[0],
      activity: activityByMonth(simulations, now),
    };
  }, [items, now]);

  const recent = [...items].sort((a, b) => b.project.updatedAt.localeCompare(a.project.updatedAt)).slice(0, 5);
  const firstName = user?.name?.split(" ")[0];
  const loadingDetails = detailsLoading && items.length > 0;
  const dash = loadingDetails ? "…" : undefined;

  return (
    <div className="product-page">
      <section className="page-welcome">
        <div>
          <p>
            {greeting()}
            {firstName ? `, ${firstName}` : ""}.
          </p>
          <h2>Quais possibilidades vamos explorar hoje?</h2>
        </div>
        <button className="product-primary" onClick={() => navigate("/app/projects/new")}>
          <Glyph name="plus" /> Novo projeto
        </button>
      </section>

      {projects.isError ? (
        <section className="surface-panel">
          <ErrorState error={projects.error} onRetry={() => projects.refetch()} />
        </section>
      ) : (
        <>
          <section className="stats-grid">
            {projects.isPending ? (
              Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={128} />)
            ) : (
              <>
                <StatCard label="PROJETOS" value={String(stats.projects)} note={`${stats.active} ativos`} icon="folder" />
                <StatCard
                  label="CENÁRIOS"
                  value={dash ?? String(stats.scenarios)}
                  note={`em ${stats.projectsWithScenarios} ${stats.projectsWithScenarios === 1 ? "projeto" : "projetos"}`}
                  icon="branch"
                />
                <StatCard
                  label="SIMULAÇÕES"
                  value={dash ?? String(stats.simulations)}
                  note={`${stats.recentSimulations} nos últimos 30 dias`}
                  icon="chart"
                />
                <StatCard
                  label="ÚLTIMA EXECUÇÃO"
                  value={dash ?? (stats.last ? formatRelative(stats.last.executedAt).split(", ").pop()! : "—")}
                  note={
                    stats.last
                      ? `${stats.last.scenarioName} · ${formatRelative(stats.last.executedAt).split(", ")[0].toLowerCase()}`
                      : "Nenhuma simulação ainda"
                  }
                  icon="clock"
                />
              </>
            )}
          </section>

          <section className="dashboard-grid">
            <div className="surface-panel activity-chart">
              <div className="panel-heading">
                <div>
                  <span>ATIVIDADE</span>
                  <h3>Simulações executadas</h3>
                </div>
                <span className="panel-note">Últimos 6 meses</span>
              </div>
              {projects.isPending || loadingDetails ? <Skeleton height={220} /> : <ActivityChart data={stats.activity} />}
            </div>
            <div className="surface-panel quick-actions">
              <div className="panel-heading">
                <div>
                  <span>ATALHOS</span>
                  <h3>Ações rápidas</h3>
                </div>
              </div>
              <button onClick={() => navigate("/app/projects/new")}>
                <i>
                  <Glyph name="plus" />
                </i>
                <span>
                  <strong>Criar projeto</strong>
                  <small>Comece uma nova análise</small>
                </span>
                <Glyph name="chevron" />
              </button>
              <button disabled={!projectId} onClick={() => navigate(`/app/projects/${projectId}/scenarios/new`)}>
                <i>
                  <Glyph name="branch" />
                </i>
                <span>
                  <strong>Novo cenário</strong>
                  <small>{projectId ? "Adicione uma hipótese" : "Crie um projeto primeiro"}</small>
                </span>
                <Glyph name="chevron" />
              </button>
              <button disabled={!projectId} onClick={() => navigate(`/app/projects/${projectId}/compare`)}>
                <i>
                  <Glyph name="spark" />
                </i>
                <span>
                  <strong>Comparar cenários</strong>
                  <small>{projectId ? "Analise as diferenças" : "Crie um projeto primeiro"}</small>
                </span>
                <Glyph name="chevron" />
              </button>
            </div>
          </section>

          <section className="surface-panel recent-projects">
            <div className="panel-heading">
              <div>
                <span>RECENTES</span>
                <h3>Projetos em andamento</h3>
              </div>
              {items.length > 0 && (
                <button onClick={() => navigate("/app/projects")}>
                  Ver todos <Glyph name="arrow" size={15} />
                </button>
              )}
            </div>
            {projects.isPending ? (
              <Skeleton height={180} />
            ) : recent.length ? (
              recent.map((i) => <ProjectRow key={i.project.id} project={i.project} scenarioCount={i.scenarioCount} />)
            ) : (
              <EmptyState
                title="Nenhum projeto ainda"
                text="Crie seu primeiro projeto para começar a montar cenários e simulações."
                action={
                  <button className="product-primary" onClick={() => navigate("/app/projects/new")}>
                    <Glyph name="plus" /> Criar projeto
                  </button>
                }
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
