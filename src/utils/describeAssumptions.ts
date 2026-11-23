import type { GlyphName } from "@/components/ui/Glyph";
import type { ScenarioAssumptions } from "@/types/api";
import { formatMoney, formatMonths, formatPercent } from "./format";

export type AssumptionGroupId = "revenue" | "costs" | "investment" | "finance" | "horizon";

export interface AssumptionGroup {
  id: AssumptionGroupId;
  title: string;
  items: { label: string; value: string; note: string; icon: GlyphName }[];
}

/** Premissas agrupadas para leitura (detalhe do cenário e revisão do formulário). Taxas chegam como fração. */
export function describeAssumptions(a: ScenarioAssumptions): AssumptionGroup[] {
  const days = (n: number) => `${n} ${n === 1 ? "dia" : "dias"}`;
  const growth = (rate: number) => `Cresce ${formatPercent(rate, 2)} ao mês`;
  return [
    {
      id: "revenue",
      title: "Receitas",
      items: [
        { label: "Receita de produtos", value: formatMoney(a.initialProductRevenue), note: growth(a.productRevenueGrowth), icon: "chart" },
        { label: "Receita de serviços", value: formatMoney(a.initialServiceRevenue), note: growth(a.serviceRevenueGrowth), icon: "chart" },
        { label: "Outras receitas", value: formatMoney(a.initialOtherRevenue), note: growth(a.otherRevenueGrowth), icon: "chart" },
      ],
    },
    {
      id: "costs",
      title: "Custos",
      items: [
        { label: "Custo variável", value: formatPercent(a.variableCostRate, 2), note: "Da receita total", icon: "arrow" },
        { label: "Custo fixo mensal", value: formatMoney(a.initialFixedCost), note: growth(a.fixedCostGrowthRate), icon: "arrow" },
      ],
    },
    {
      id: "investment",
      title: "Investimento e ativos",
      items: [
        { label: "Investimento inicial", value: formatMoney(a.initialInvestment), note: "Saída no início da projeção", icon: "folder" },
        { label: "Capex recorrente", value: formatPercent(a.capexRate, 2), note: "Da receita, todo mês", icon: "folder" },
        {
          label: "Ativos depreciáveis",
          value: formatMoney(a.depreciableAssetValue),
          note: `Vida útil de ${formatMonths(a.usefulLifeMonths)}`,
          icon: "folder",
        },
        { label: "Amortização mensal", value: formatMoney(a.amortizationPerMonth), note: "Intangíveis", icon: "folder" },
      ],
    },
    {
      id: "finance",
      title: "Juros, impostos e capital de giro",
      items: [
        { label: "Juros mensais", value: formatMoney(a.interestExpense), note: "Despesa financeira", icon: "spark" },
        { label: "Alíquota efetiva", value: formatPercent(a.effectiveTaxRate, 2), note: "Sobre o lucro tributável", icon: "spark" },
        {
          label: "Prazos de giro",
          value: `${days(a.daysSalesOutstanding)} · ${days(a.daysPayableOutstanding)} · ${days(a.daysInventoryOutstanding)}`,
          note: "Recebimento · pagamento · estoque",
          icon: "clock",
        },
      ],
    },
    {
      id: "horizon",
      title: "Horizonte",
      items: [{ label: "Período da projeção", value: formatMonths(a.projectionMonths), note: "Meses calculados", icon: "clock" }],
    },
  ];
}
