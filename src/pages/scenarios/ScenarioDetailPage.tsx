import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Glyph } from "@/components/ui/Glyph";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SimulationHistory } from "@/components/shared/SimulationHistory";
import { EmptyState, ErrorState, LoadingState, Skeleton } from "@/components/shared/States";
import { StatusPill } from "@/components/shared/StatusPill";
import { usePageMeta } from "@/contexts/PageMetaContext";
import { useDeleteScenario, useProject, useRunSimulation, useScenario, useScenarioSimulations } from "@/hooks/queries";
import { getErrorMessage } from "@/services/api";
import { describeAssumptions } from "@/utils/describeAssumptions";
import { formatRelative } from "@/utils/format";

export function ScenarioDetailPage() {
  const { projectId = "", scenarioId = "" } = useParams();
  const navigate = useNavigate();
  const project = useProject(projectId);
  const scenario = useScenario(projectId, scenarioId);
  const history = useScenarioSimulations(projectId, scenarioId);
  const run = useRunSimulation(projectId);
  const remove = useDeleteScenario(projectId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  usePageMeta(`${project.data?.name?.toUpperCase() ?? "PROJETO"} / CENÁRIOS`, scenario.data?.name ?? "Cenário");

  if (scenario.isPending) return <LoadingState />;
  if (scenario.isError) {
    return (
      <div className="product-page">
        <ErrorState error={scenario.error} notFoundTitle="Cenário não encontrado" onRetry={() => scenario.refetch()} />
      </div>
    );
  }
  const s = scenario.data;
  const simulations = history.data ?? [];
  const latest = simulations[0];
  const outdated = latest && latest.scenarioVersion !== s.version;
  const base = `/app/projects/${projectId}/scenarios/${scenarioId}`;

  const execute = async () => {
    try {
      const simulation = await run.mutateAsync(scenarioId);
      toast.success("Simulação concluída.");
      navigate(`${base}/simulations/${simulation.id}`);
    } catch (e) {
      toast.error(getErrorMessage(e, "Não foi possível executar a simulação."));
    }
  };

  const deleteScenario = async () => {
    try {
      await remove.mutateAsync(scenarioId);
      toast.success("Cenário excluído.");
      navigate(`/app/projects/${projectId}`, { replace: true });
    } catch (e) {
      toast.error(getErrorMessage(e));
      setConfirmDelete(false);
    }
  };

  return (
    <div className="product-page">
      <button className="back-link" onClick={() => navigate(`/app/projects/${projectId}`)}>
        <span>←</span> {project.data?.name ?? "Voltar ao projeto"}
      </button>
      <section className="page-title-row scenario-heading">
        <div>
          <div className="scenario-title-line">
            <span className="scenario-orb">
              <Glyph name="branch" />
            </span>
            <div>
              <StatusPill label={latest ? (outdated ? "Premissas alteradas" : "Simulado") : "Sem simulação"} muted={!latest || outdated} />
              <h2>
                {s.name} <small>v{s.version}</small>
              </h2>
              {s.description && <p>{s.description}</p>}
            </div>
          </div>
        </div>
        <div>
          <button className="product-secondary icon-only" onClick={() => setConfirmDelete(true)} aria-label="Excluir cenário" title="Excluir cenário">
            <Glyph name="trash" />
          </button>
          <button className="product-secondary" onClick={() => navigate(`${base}/edit`)}>
            Editar cenário
          </button>
          <button className="product-primary" onClick={execute} disabled={run.isPending}>
            {run.isPending ? (
              <>
                <span className="spinner" /> Executando
              </>
            ) : (
              <>
                <Glyph name="spark" /> Executar simulação
              </>
            )}
          </button>
        </div>
      </section>
      <div className="projection-warning">
        <Glyph name="spark" />
        <p>
          <strong>Projeção baseada em premissas.</strong> Os resultados apoiam a análise, mas não representam garantia de
          desempenho futuro.
          {outdated && ` A última simulação usou a versão ${latest.scenarioVersion}; execute de novo para refletir a versão ${s.version}.`}
        </p>
      </div>

      <section className="section-row-heading">
        <div>
          <span>PREMISSAS ATUAIS · VERSÃO {s.version}</span>
          <h3>Configuração financeira</h3>
        </div>
        <span className="last-update">Atualizado {formatRelative(s.updatedAt).toLowerCase()}</span>
      </section>
      {describeAssumptions(s.assumptions).map((group) => (
        <div key={group.title} className="variable-group">
          <h4>{group.title}</h4>
          <div className="variable-grid">
            {group.items.map((v) => (
              <article key={v.label}>
                <span>
                  <Glyph name={v.icon} />
                </span>
                <div>
                  <small>{v.label.toUpperCase()}</small>
                  <strong>{v.value}</strong>
                  <p>{v.note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}

      <section className="surface-panel history-panel">
        <div className="panel-heading">
          <div>
            <span>HISTÓRICO</span>
            <h3>Simulações anteriores</h3>
          </div>
          {simulations.length > 0 && (
            <button onClick={() => navigate(`${base}/simulations`)}>
              Ver resultados <Glyph name="arrow" />
            </button>
          )}
        </div>
        {history.isPending ? (
          <Skeleton height={140} />
        ) : history.isError ? (
          <ErrorState error={history.error} onRetry={() => history.refetch()} />
        ) : simulations.length ? (
          <SimulationHistory simulations={simulations.slice(0, 5)} onOpen={(sim) => navigate(`${base}/simulations/${sim.id}`)} />
        ) : (
          <EmptyState
            icon="chart"
            title="Nenhuma simulação ainda"
            text="Execute a primeira simulação para ver a projeção mês a mês destas premissas."
          />
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir cenário?"
        description={
          <>
            <strong>{s.name}</strong> e {simulations.length === 1 ? "a simulação dele" : `as ${simulations.length} simulações dele`} serão
            excluídos. Esta ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir cenário"
        danger
        pending={remove.isPending}
        onConfirm={deleteScenario}
      />
    </div>
  );
}
