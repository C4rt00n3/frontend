import { Glyph } from "@/components/ui/Glyph";
import type { SimulationSummary } from "@/types/api";
import { formatMoneyCompact, formatRelative, paybackLabel, shortId } from "@/utils/format";

/** Tabela de execuções. `showScenario` troca a coluna de versão por "cenário · versão". */
export function SimulationHistory({
  simulations,
  onOpen,
  showScenario = false,
  activeId,
}: {
  simulations: SimulationSummary[];
  onOpen: (simulation: SimulationSummary) => void;
  showScenario?: boolean;
  activeId?: string;
}) {
  return (
    <div className="history-table">
      <div className="history-head">
        <span>EXECUÇÃO</span>
        <span>{showScenario ? "CENÁRIO" : "VERSÃO"}</span>
        <span>RECEITA TOTAL</span>
        <span>SALDO FINAL</span>
        <span>PAYBACK</span>
        <span>DATA</span>
        <span />
      </div>
      {simulations.map((s) => (
        <button key={s.id} onClick={() => onOpen(s)} className={s.id === activeId ? "active" : ""} aria-current={s.id === activeId}>
          <span className="mono">{shortId(s.id)}</span>
          <span>{showScenario ? `${s.scenarioName} · v${s.scenarioVersion}` : `v${s.scenarioVersion}`}</span>
          <span>{formatMoneyCompact(s.results.totalRevenue)}</span>
          <span className={s.results.finalAccumulatedCashFlow >= 0 ? "positive" : "negative"}>
            {formatMoneyCompact(s.results.finalAccumulatedCashFlow)}
          </span>
          <span>{paybackLabel(s.results.paybackMonth)}</span>
          <span>{formatRelative(s.executedAt)}</span>
          <Glyph name="chevron" />
        </button>
      ))}
    </div>
  );
}
