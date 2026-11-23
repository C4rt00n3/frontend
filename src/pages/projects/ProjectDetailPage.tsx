import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Glyph } from "@/components/ui/Glyph";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { OptionsMenu } from "@/components/shared/OptionsMenu";
import { SimulationHistory } from "@/components/shared/SimulationHistory";
import { EmptyState, ErrorState, LoadingState, Skeleton } from "@/components/shared/States";
import { ProjectStatusPill, StatusPill } from "@/components/shared/StatusPill";
import { scenarioColor } from "@/components/charts/theme";
import { usePageMeta } from "@/contexts/PageMetaContext";
import { useDeleteProject, useProject, useProjectSimulations, useScenarios, useUpdateProject } from "@/hooks/queries";
import { getErrorMessage } from "@/services/api";
import type { Scenario, SimulationSummary } from "@/types/api";
import { initialCost, initialRevenue, weightedRevenueGrowth } from "@/utils/assumptions";
import { formatDate, formatMoney, formatPercent, formatRelative } from "@/utils/format";

function ScenarioCard({
  scenario,
  color,
  simulated,
  onOpen,
}: {
  scenario: Scenario;
  color: string;
  simulated: boolean;
  onOpen: () => void;
}) {
  const a = scenario.assumptions;
  return (
    <button className="scenario-card" onClick={onOpen}>
      <div className="scenario-top">
        <span style={{ background: color }}>
          <Glyph name="branch" />
        </span>
        <StatusPill label={simulated ? "Simulado" : "Sem simulação"} muted={!simulated} />
      </div>
      <h3>{scenario.name}</h3>
      <small>
        v{scenario.version} · Atualizado {formatRelative(scenario.updatedAt).toLowerCase()}
      </small>
      <div className="scenario-values">
        <div>
          <span>RECEITA INICIAL</span>
          <strong>{formatMoney(initialRevenue(a))}</strong>
        </div>
        <div>
          <span>CUSTO INICIAL</span>
          <strong>{formatMoney(initialCost(a))}</strong>
        </div>
      </div>
      <div className="scenario-footer">
        <span>Crescimento mensal da receita</span>
        <strong>{formatPercent(weightedRevenueGrowth(a))}</strong>
        <Glyph name="chevron" />
      </div>
    </button>
  );
}

export function ProjectDetailPage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "history" ? "history" : "overview";

  const project = useProject(projectId);
  const scenarios = useScenarios(projectId);
  const simulations = useProjectSimulations(projectId);
  const update = useUpdateProject(projectId);
  const remove = useDeleteProject();
  const [confirmDelete, setConfirmDelete] = useState(false);

  usePageMeta("PROJETOS", project.data?.name ?? "Projeto");

  const simulatedIds = useMemo(
    () => new Set((simulations.data ?? []).map((s) => s.scenarioId)),
    [simulations.data],
  );
  const latest = simulations.data?.[0];
  const maxHorizon = Math.max(0, ...(scenarios.data ?? []).map((s) => s.assumptions.projectionMonths));

  if (project.isPending) return <LoadingState />;
  if (project.isError) {
    return (
      <div className="product-page">
        <ErrorState error={project.error} notFoundTitle="Projeto não encontrado" onRetry={() => project.refetch()} />
      </div>
    );
  }
  const p = project.data;
  const archived = p.status === "ARCHIVED";
  const scenarioCount = scenarios.data?.length ?? 0;
  const openSimulation = (s: SimulationSummary) =>
    navigate(`/app/projects/${projectId}/scenarios/${s.scenarioId}/simulations/${s.id}`);

  const toggleArchive = async () => {
    try {
      await update.mutateAsync({ status: archived ? "ACTIVE" : "ARCHIVED" });
      toast.success(archived ? "Projeto reativado." : "Projeto arquivado.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const deleteProject = async () => {
    try {
      await remove.mutateAsync(projectId);
      toast.success("Projeto excluído.");
      navigate("/app/projects", { replace: true });
    } catch (e) {
      toast.error(getErrorMessage(e));
      setConfirmDelete(false);
    }
  };

  return (
    <div className="product-page">
      <section className="project-hero">
        <div>
          <ProjectStatusPill status={p.status} />
          <h2>{p.name}</h2>
          {p.description && <p>{p.description}</p>}
          <div className="project-meta">
            <span>Criado em {formatDate(p.createdAt)}</span>
            <i /> <span>Atualizado {formatRelative(p.updatedAt).toLowerCase()}</span>
          </div>
        </div>
        <div>
          <OptionsMenu
            options={[
              { label: "Editar projeto", icon: "edit", onSelect: () => navigate(`/app/projects/${projectId}/edit`) },
              { label: archived ? "Reativar projeto" : "Arquivar projeto", icon: "archive", onSelect: toggleArchive },
              { label: "Excluir projeto", icon: "trash", danger: true, onSelect: () => setConfirmDelete(true) },
            ]}
          />
          <button className="product-primary" onClick={() => navigate(`/app/projects/${projectId}/scenarios/new`)}>
            <Glyph name="plus" /> Novo cenário
          </button>
        </div>
      </section>

      <nav className="detail-tabs" aria-label="Seções do projeto">
        <button className={tab === "overview" ? "active" : ""} onClick={() => setParams({}, { replace: true })}>
          Visão geral
        </button>
        <button
          onClick={() => {
            setParams({}, { replace: true });
            document.getElementById("cenarios")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Cenários <span>{scenarioCount}</span>
        </button>
        <button onClick={() => navigate(`/app/projects/${projectId}/compare`)}>Comparar</button>
        <button className={tab === "history" ? "active" : ""} onClick={() => setParams({ tab: "history" }, { replace: true })}>
          Histórico {simulations.data && <span>{simulations.data.length}</span>}
        </button>
      </nav>

      {tab === "history" ? (
        <section className="surface-panel history-panel">
          <div className="panel-heading">
            <div>
              <span>HISTÓRICO</span>
              <h3>Simulações do projeto</h3>
            </div>
          </div>
          {simulations.isPending ? (
            <Skeleton height={160} />
          ) : simulations.isError ? (
            <ErrorState error={simulations.error} onRetry={() => simulations.refetch()} />
          ) : simulations.data.length ? (
            <SimulationHistory simulations={simulations.data} onOpen={openSimulation} showScenario />
          ) : (
            <EmptyState icon="chart" title="Nenhuma simulação executada" text="Abra um cenário e execute a primeira simulação." />
          )}
        </section>
      ) : (
        <>
          <section className="project-summary-grid">
            <article className="surface-panel objective-card">
              <span>OBJETIVO DA SIMULAÇÃO</span>
              <Glyph name="spark" />
              <p>{p.objective || "Nenhum objetivo definido. Edite o projeto para registrar a decisão que esta análise deve apoiar."}</p>
            </article>
            <article className="surface-panel project-summary">
              <div>
                <span>CENÁRIOS</span>
                <strong>{scenarios.isPending ? "…" : scenarioCount}</strong>
                <small>{simulatedIds.size} simulados</small>
              </div>
              <div>
                <span>SIMULAÇÕES</span>
                <strong>{simulations.isPending ? "…" : (simulations.data?.length ?? 0)}</strong>
                <small>{latest ? `última ${formatRelative(latest.executedAt).split(",")[0].toLowerCase()}` : "nenhuma ainda"}</small>
              </div>
              <div>
                <span>HORIZONTE</span>
                <strong>{maxHorizon || "—"}</strong>
                <small>{maxHorizon ? "meses (maior cenário)" : "sem cenários"}</small>
              </div>
            </article>
          </section>

          <section className="section-row-heading" id="cenarios">
            <div>
              <span>CENÁRIOS DO PROJETO</span>
              <h3>Explore diferentes possibilidades</h3>
            </div>
            {scenarioCount >= 2 && (
              <button onClick={() => navigate(`/app/projects/${projectId}/compare`)}>
                Comparar cenários <Glyph name="arrow" />
              </button>
            )}
          </section>
          {scenarios.isPending ? (
            <Skeleton height={220} />
          ) : scenarios.isError ? (
            <ErrorState error={scenarios.error} onRetry={() => scenarios.refetch()} />
          ) : scenarioCount ? (
            <div className="scenario-card-grid">
              {scenarios.data.map((s, i) => (
                <ScenarioCard
                  key={s.id}
                  scenario={s}
                  color={scenarioColor(i)}
                  simulated={simulatedIds.has(s.id)}
                  onOpen={() => navigate(`/app/projects/${projectId}/scenarios/${s.id}`)}
                />
              ))}
            </div>
          ) : (
            <section className="surface-panel">
              <EmptyState
                icon="branch"
                title="Nenhum cenário neste projeto"
                text="Cenários são hipóteses: crie, por exemplo, um cenário base, um otimista e um conservador."
                action={
                  <button className="product-primary" onClick={() => navigate(`/app/projects/${projectId}/scenarios/new`)}>
                    <Glyph name="plus" /> Criar primeiro cenário
                  </button>
                }
              />
            </section>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir projeto?"
        description={
          <>
            <strong>{p.name}</strong> será excluído junto com {scenarioCount} {scenarioCount === 1 ? "cenário" : "cenários"} e todas as
            simulações. Esta ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir projeto"
        danger
        pending={remove.isPending}
        onConfirm={deleteProject}
      />
    </div>
  );
}
