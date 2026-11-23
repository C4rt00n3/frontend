import { useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router";
import { Glyph } from "@/components/ui/Glyph";
import { ComparisonCashChart } from "@/components/charts/FinancialCharts";
import { scenarioColor } from "@/components/charts/theme";
import { EmptyState, ErrorState, LoadingState, Skeleton } from "@/components/shared/States";
import { usePageMeta } from "@/contexts/PageMetaContext";
import { useProject, useProjectSimulations, useScenarios, useSimulations } from "@/hooks/queries";
import type { SimulationResults, SimulationSummary } from "@/types/api";
import { formatChange, formatMoneyCompact, formatPercent, formatRelative, paybackLabel } from "@/utils/format";

const ROWS: { label: string; value: (r: SimulationResults) => string }[] = [
  { label: "Investimento inicial", value: (r) => formatMoneyCompact(r.initialInvestment) },
  { label: "Receita total projetada", value: (r) => formatMoneyCompact(r.totalRevenue) },
  { label: "Custos totais projetados", value: (r) => formatMoneyCompact(r.totalCosts) },
  { label: "Resultado operacional (EBITDA)", value: (r) => formatMoneyCompact(r.ebitda) },
  { label: "Margem EBITDA", value: (r) => formatPercent(r.ebitdaMargin) },
  { label: "Lucro líquido", value: (r) => formatMoneyCompact(r.netIncome) },
  { label: "Fluxo de caixa livre", value: (r) => formatMoneyCompact(r.totalFreeCashFlow) },
  { label: "Saldo final", value: (r) => formatMoneyCompact(r.finalAccumulatedCashFlow) },
  { label: "Payback simples", value: (r) => paybackLabel(r.paybackMonth) },
];

export function ComparePage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const project = useProject(projectId);
  const scenarios = useScenarios(projectId);
  const simulations = useProjectSimulations(projectId);
  const [picked, setPicked] = useState<string[] | null>(null);

  usePageMeta(`${project.data?.name?.toUpperCase() ?? "PROJETO"} / ANÁLISE`, "Comparar cenários");

  // Cor fixa por cenário (ordem do projeto) e a simulação mais recente de cada um.
  const options = useMemo(() => {
    const latest = new Map<string, SimulationSummary>();
    for (const s of simulations.data ?? []) if (!latest.has(s.scenarioId)) latest.set(s.scenarioId, s);
    return (scenarios.data ?? []).map((scenario, i) => ({
      scenario,
      color: scenarioColor(i),
      latest: latest.get(scenario.id),
    }));
  }, [scenarios.data, simulations.data]);

  const comparable = options.filter((o) => o.latest);
  // Até o usuário escolher, compara os dois primeiros cenários que já têm simulação.
  const selected = picked ?? comparable.slice(0, 2).map((o) => o.scenario.id);
  const chosen = options.filter((o) => o.latest && selected.includes(o.scenario.id));
  const details = useSimulations(projectId, chosen.map((o) => o.latest!.id));

  const toggle = (id: string) =>
    setPicked(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  if (scenarios.isPending || simulations.isPending) return <LoadingState />;
  const error = scenarios.error ?? simulations.error;
  if (error) {
    return (
      <div className="product-page">
        <ErrorState error={error} notFoundTitle="Projeto não encontrado" onRetry={() => (scenarios.refetch(), simulations.refetch())} />
      </div>
    );
  }

  const reference = chosen[0]?.latest?.results.finalAccumulatedCashFlow;
  const ready = chosen.length >= 2;
  const detailsLoading = details.some((d) => d.isPending);

  return (
    <div className="product-page">
      <section className="page-title-row">
        <div>
          <h2>Compare possibilidades</h2>
          <p>Analise premissas e resultados lado a lado, usando a última simulação de cada cenário.</p>
        </div>
        <button className="product-secondary" onClick={() => navigate(`/app/projects/${projectId}`)}>
          <span>←</span> Voltar ao projeto
        </button>
      </section>

      {options.length < 2 ? (
        <section className="surface-panel">
          <EmptyState
            icon="branch"
            title="Crie pelo menos dois cenários"
            text="A comparação coloca hipóteses lado a lado. Este projeto ainda não tem cenários suficientes."
            action={
              <button className="product-primary" onClick={() => navigate(`/app/projects/${projectId}/scenarios/new`)}>
                <Glyph name="plus" /> Novo cenário
              </button>
            }
          />
        </section>
      ) : (
        <>
          <section className="surface-panel compare-selector">
            <div className="panel-heading">
              <div>
                <span>SELEÇÃO</span>
                <h3>Escolha pelo menos dois cenários</h3>
              </div>
              <span>
                {chosen.length} {chosen.length === 1 ? "selecionado" : "selecionados"}
              </span>
            </div>
            <div className="compare-options">
              {options.map((o) => {
                const isSelected = !!o.latest && selected.includes(o.scenario.id);
                return (
                  <button
                    key={o.scenario.id}
                    className={isSelected ? "selected" : ""}
                    disabled={!o.latest}
                    aria-pressed={isSelected}
                    onClick={() => toggle(o.scenario.id)}
                    title={o.latest ? undefined : "Execute uma simulação deste cenário para compará-lo"}
                  >
                    <span className="check-box">{isSelected && <Glyph name="check" size={14} />}</span>
                    <i style={{ background: o.color }} />
                    <div>
                      <strong>{o.scenario.name}</strong>
                      <small>
                        {o.latest
                          ? `v${o.latest.scenarioVersion} · ${formatRelative(o.latest.executedAt).toLowerCase()}`
                          : "sem simulação"}
                      </small>
                    </div>
                  </button>
                );
              })}
            </div>
            {comparable.length < 2 && (
              <p className="panel-note compare-hint">
                Só cenários com simulação podem ser comparados. Abra um cenário e execute a simulação para incluí-lo.
              </p>
            )}
          </section>

          {ready && (
            <>
              <section className="compare-hero-grid">
                {chosen.map((o, index) => {
                  const value = o.latest!.results.finalAccumulatedCashFlow;
                  const change = index === 0 || reference == null ? null : formatChange(value, reference);
                  return (
                    <article key={o.scenario.id} style={{ "--accent": o.color } as CSSProperties}>
                      <div>
                        <i />
                        <span>{o.scenario.name.toUpperCase()}</span>
                        <small>v{o.latest!.scenarioVersion}</small>
                      </div>
                      <strong>{formatMoneyCompact(value)}</strong>
                      <p>SALDO FINAL PROJETADO</p>
                      <span className="comparison-change">
                        {index === 0 ? "Referência" : change ? `${change} vs. ${chosen[0].scenario.name}` : "Sem base de comparação"}
                      </span>
                    </article>
                  );
                })}
              </section>

              <section className="surface-panel comparison-table">
                <div className="panel-heading">
                  <div>
                    <span>INDICADORES</span>
                    <h3>Comparação consolidada</h3>
                  </div>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>INDICADOR</th>
                        {chosen.map((o) => (
                          <th key={o.scenario.id}>
                            <i style={{ background: o.color }} /> {o.scenario.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ROWS.map((row) => (
                        <tr key={row.label}>
                          <td>{row.label}</td>
                          {chosen.map((o) => (
                            <td key={o.scenario.id}>{row.value(o.latest!.results)}</td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td>Horizonte</td>
                        {chosen.map((o, i) => (
                          <td key={o.scenario.id}>{details[i]?.data ? `${details[i].data.monthlyProjections.length} meses` : "…"}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="surface-panel results-graph compare-graph">
                <div className="panel-heading">
                  <div>
                    <span>EVOLUÇÃO</span>
                    <h3>Saldo acumulado por cenário</h3>
                  </div>
                  <div className="graph-legend">
                    {chosen.map((o) => (
                      <span key={o.scenario.id}>
                        <i style={{ background: o.color }} /> {o.scenario.name}
                      </span>
                    ))}
                  </div>
                </div>
                {detailsLoading ? (
                  <Skeleton height={280} />
                ) : (
                  <ComparisonCashChart
                    series={chosen.map((o, i) => ({
                      id: o.scenario.id,
                      name: o.scenario.name,
                      color: o.color,
                      values: details[i]?.data?.monthlyProjections.map((m) => m.accumulatedCashFlow) ?? [],
                    }))}
                  />
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
