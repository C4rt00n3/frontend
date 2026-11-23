import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Glyph } from "@/components/ui/Glyph";
import { CumulativeCashChart, MonthlyResultChart, RevenueCostChart } from "@/components/charts/FinancialCharts";
import { SimulationHistory } from "@/components/shared/SimulationHistory";
import { EmptyState, ErrorState, LoadingState, Skeleton } from "@/components/shared/States";
import { StatusPill } from "@/components/shared/StatusPill";
import { usePageMeta } from "@/contexts/PageMetaContext";
import { useProject, useRunSimulation, useScenario, useScenarioSimulations, useSimulation } from "@/hooks/queries";
import { getErrorMessage } from "@/services/api";
import type { Simulation, SimulationSummary } from "@/types/api";
import {
  formatChange,
  formatMoney,
  formatMoneyCompact,
  formatMonths,
  formatPercent,
  formatRelative,
  paybackLabel,
  shortId,
} from "@/utils/format";

function MetricCard({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "positive" | "negative" }) {
  return (
    <article className="result-metric">
      <span>{label}</span>
      <strong title={value}>{value}</strong>
      <small className={tone}>{note}</small>
    </article>
  );
}

function vsPrevious(value: number, previous: number | undefined) {
  if (previous == null) return "Primeira simulação do cenário";
  const change = formatChange(value, previous);
  return change ? `${change} sobre a simulação anterior` : "Sem base de comparação";
}

function Overview({ simulation, previous }: { simulation: Simulation; previous?: SimulationSummary }) {
  const r = simulation.results;
  const p = previous?.results;
  const months = simulation.monthlyProjections.length;
  return (
    <>
      <section className="result-metrics">
        <MetricCard label="RECEITA TOTAL" value={formatMoneyCompact(r.totalRevenue)} note={vsPrevious(r.totalRevenue, p?.totalRevenue)} />
        <MetricCard label="CUSTOS TOTAIS" value={formatMoneyCompact(r.totalCosts)} note={vsPrevious(r.totalCosts, p?.totalCosts)} />
        <MetricCard
          label="RESULTADO OPERACIONAL"
          value={formatMoneyCompact(r.ebitda)}
          note={r.ebitdaMargin != null ? `Margem EBITDA de ${formatPercent(r.ebitdaMargin)}` : "Sem receita no período"}
          tone={r.ebitda >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          label="SALDO FINAL"
          value={formatMoneyCompact(r.finalAccumulatedCashFlow)}
          note={`Após investimento de ${formatMoneyCompact(r.initialInvestment)}`}
          tone={r.finalAccumulatedCashFlow >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          label="PAYBACK SIMPLES"
          value={paybackLabel(r.paybackMonth)}
          note={r.paybackMonth != null ? "Dentro do horizonte" : `Não recuperado em ${formatMonths(months)}`}
          tone={r.paybackMonth != null ? "positive" : "negative"}
        />
      </section>
      <section className="result-metrics secondary">
        <MetricCard label="LUCRO LÍQUIDO" value={formatMoneyCompact(r.netIncome)} note="Após juros e impostos" tone={r.netIncome >= 0 ? undefined : "negative"} />
        <MetricCard label="IMPOSTOS" value={formatMoneyCompact(r.totalIncomeTax)} note="Total no horizonte" />
        <MetricCard label="CAPEX" value={formatMoneyCompact(r.totalCapex)} note="Reinvestimento total" />
        <MetricCard label="FLUXO DE CAIXA LIVRE" value={formatMoneyCompact(r.totalFreeCashFlow)} note="Soma no horizonte" />
        <MetricCard label="EBIT" value={formatMoneyCompact(r.ebit)} note="Após depreciação e amortização" />
      </section>

      <section className="surface-panel results-graph">
        <div className="panel-heading">
          <div>
            <span>EVOLUÇÃO FINANCEIRA</span>
            <h3>Receita versus custos</h3>
          </div>
          <div className="graph-legend">
            <span>
              <i className="purple" /> Receita
            </span>
            <span>
              <i className="orange" /> Custos
            </span>
          </div>
        </div>
        <RevenueCostChart data={simulation.monthlyProjections} />
      </section>
      <section className="results-dual">
        <div className="surface-panel results-graph">
          <div className="panel-heading">
            <div>
              <span>RESULTADO MENSAL</span>
              <h3>Resultado operacional</h3>
            </div>
          </div>
          <MonthlyResultChart data={simulation.monthlyProjections} />
        </div>
        <div className="surface-panel results-graph">
          <div className="panel-heading">
            <div>
              <span>RETORNO</span>
              <h3>Fluxo acumulado</h3>
            </div>
            <span className="payback-tag">PAYBACK · {paybackLabel(r.paybackMonth).toUpperCase()}</span>
          </div>
          <CumulativeCashChart data={simulation.monthlyProjections} paybackMonth={r.paybackMonth} />
        </div>
      </section>
    </>
  );
}

function MonthlyTable({ simulation }: { simulation: Simulation }) {
  return (
    <section className="surface-panel monthly-table">
      <div className="panel-heading">
        <div>
          <span>DETALHAMENTO</span>
          <h3>Projeção mês a mês</h3>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>MÊS</th>
              <th>RECEITA</th>
              <th>CUSTOS</th>
              <th>RESULTADO OPERACIONAL</th>
              <th>LUCRO LÍQUIDO</th>
              <th>FLUXO LIVRE</th>
              <th>FLUXO ACUMULADO</th>
            </tr>
          </thead>
          <tbody>
            {simulation.monthlyProjections.map((m) => (
              <tr key={m.month}>
                <td>Mês {m.month}</td>
                <td>{formatMoney(m.totalRevenue)}</td>
                <td>{formatMoney(m.operatingCosts)}</td>
                <td className={m.ebitda >= 0 ? "positive" : "negative"}>{formatMoney(m.ebitda)}</td>
                <td className={m.netIncome >= 0 ? "" : "negative"}>{formatMoney(m.netIncome)}</td>
                <td>{formatMoney(m.freeCashFlow)}</td>
                <td className={m.accumulatedCashFlow >= 0 ? "positive" : "negative"}>{formatMoney(m.accumulatedCashFlow)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SimulationResultsPage() {
  const { projectId = "", scenarioId = "", simulationId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "monthly">("overview");
  const project = useProject(projectId);
  const scenario = useScenario(projectId, scenarioId);
  const history = useScenarioSimulations(projectId, scenarioId);
  const run = useRunSimulation(projectId);

  // Sem id na URL, mostra a simulação mais recente do cenário.
  const selectedId = simulationId ?? history.data?.[0]?.id;
  const simulation = useSimulation(projectId, selectedId);
  const base = `/app/projects/${projectId}/scenarios/${scenarioId}`;

  usePageMeta(`${scenario.data?.name?.toUpperCase() ?? "CENÁRIO"} / SIMULAÇÕES`, "Resultado da simulação");

  const execute = async () => {
    try {
      const created = await run.mutateAsync(scenarioId);
      toast.success("Simulação concluída.");
      navigate(`${base}/simulations/${created.id}`);
    } catch (e) {
      toast.error(getErrorMessage(e, "Não foi possível executar a simulação."));
    }
  };

  if (history.isPending || (selectedId && simulation.isPending)) return <LoadingState label="Carregando resultados…" />;
  const error = history.error ?? simulation.error ?? scenario.error;
  if (error) {
    return (
      <div className="product-page">
        <ErrorState error={error} notFoundTitle="Simulação não encontrada" onRetry={() => (history.refetch(), simulation.refetch())} />
      </div>
    );
  }

  if (!simulation.data) {
    return (
      <div className="product-page">
        <button className="back-link" onClick={() => navigate(base)}>
          <span>←</span> Voltar ao cenário
        </button>
        <section className="surface-panel">
          <EmptyState
            icon="chart"
            title="Nenhuma simulação executada"
            text={`Execute uma simulação de ${scenario.data?.name ?? "este cenário"} para ver a projeção.`}
            action={
              <button className="product-primary" onClick={execute} disabled={run.isPending}>
                {run.isPending ? <span className="spinner" /> : <Glyph name="spark" />} Executar simulação
              </button>
            }
          />
        </section>
      </div>
    );
  }

  const sim = simulation.data;
  const list = history.data ?? [];
  const index = list.findIndex((s) => s.id === sim.id);
  const previous = index >= 0 ? list[index + 1] : undefined;
  const outdated = scenario.data && scenario.data.version !== sim.scenarioSnapshot.version;

  return (
    <div className="product-page">
      <section className="result-header">
        <div>
          <StatusPill label="Concluída" />
          <h2>
            Resultado da simulação <small>{shortId(sim.id)}</small>
          </h2>
          <p>
            {sim.scenarioSnapshot.name} · versão {sim.scenarioSnapshot.version} · {project.data?.name ? `${project.data.name} · ` : ""}
            Executada {formatRelative(sim.executedAt).toLowerCase()}
          </p>
        </div>
        <div>
          <button className="product-secondary" onClick={() => navigate(base)}>
            <span>←</span> Voltar ao cenário
          </button>
          <button className="product-secondary" onClick={execute} disabled={run.isPending}>
            {run.isPending ? <span className="spinner" /> : <Glyph name="spark" />} Executar de novo
          </button>
          <button className="product-primary" onClick={() => navigate(`/app/projects/${projectId}/compare`)}>
            <Glyph name="spark" /> Comparar
          </button>
        </div>
      </section>
      <div className="projection-warning">
        <Glyph name="spark" />
        <p>
          <strong>Resultado projetado.</strong> Valores calculados a partir das premissas da versão {sim.scenarioSnapshot.version}, em{" "}
          {formatMonths(sim.monthlyProjections.length)}. Não representam garantia de desempenho futuro.
          {outdated && ` O cenário já está na versão ${scenario.data!.version}.`}
        </p>
      </div>
      <nav className="detail-tabs result-tabs" aria-label="Visualização do resultado">
        <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
          Visão geral
        </button>
        <button className={tab === "monthly" ? "active" : ""} onClick={() => setTab("monthly")}>
          Evolução mensal
        </button>
      </nav>
      {tab === "overview" ? <Overview simulation={sim} previous={previous} /> : <MonthlyTable simulation={sim} />}

      {list.length > 1 && (
        <section className="surface-panel history-panel">
          <div className="panel-heading">
            <div>
              <span>HISTÓRICO</span>
              <h3>Outras execuções deste cenário</h3>
            </div>
          </div>
          {history.isFetching && !history.data ? (
            <Skeleton height={120} />
          ) : (
            <SimulationHistory simulations={list} activeId={sim.id} onOpen={(s) => navigate(`${base}/simulations/${s.id}`)} />
          )}
        </section>
      )}
    </div>
  );
}
