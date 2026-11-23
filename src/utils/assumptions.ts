import type { ScenarioAssumptions } from "@/types/api";

/** Campos que a API recebe como fração (0.032) e o formulário mostra em porcentagem (3,2). */
export const PERCENT_FIELDS = [
  "productRevenueGrowth",
  "serviceRevenueGrowth",
  "otherRevenueGrowth",
  "variableCostRate",
  "fixedCostGrowthRate",
  "capexRate",
  "effectiveTaxRate",
] as const satisfies readonly (keyof ScenarioAssumptions)[];

type PercentField = (typeof PERCENT_FIELDS)[number];

const isPercent = (key: string): key is PercentField => (PERCENT_FIELDS as readonly string[]).includes(key);

// Arredonda para evitar ruído de ponto flutuante (3.2 / 100 = 0.032000000000000001).
const round = (value: number, digits: number) => Number(value.toFixed(digits));

/** Valores do formulário (porcentagens) → corpo da API (frações). */
export function toApiAssumptions(form: ScenarioAssumptions): ScenarioAssumptions {
  const out = { ...form };
  for (const key of Object.keys(out) as (keyof ScenarioAssumptions)[]) {
    out[key] = isPercent(key) ? round(form[key] / 100, 8) : form[key];
  }
  return out;
}

/** Resposta da API (frações) → valores do formulário (porcentagens). */
export function toFormAssumptions(api: ScenarioAssumptions): ScenarioAssumptions {
  const out = { ...api };
  for (const key of Object.keys(out) as (keyof ScenarioAssumptions)[]) {
    out[key] = isPercent(key) ? round(Number(api[key]) * 100, 6) : Number(api[key]);
  }
  return out;
}

export const EMPTY_ASSUMPTIONS: ScenarioAssumptions = {
  initialProductRevenue: 0,
  initialServiceRevenue: 0,
  initialOtherRevenue: 0,
  productRevenueGrowth: 0,
  serviceRevenueGrowth: 0,
  otherRevenueGrowth: 0,
  variableCostRate: 0,
  initialFixedCost: 0,
  fixedCostGrowthRate: 0,
  initialInvestment: 0,
  depreciableAssetValue: 0,
  usefulLifeMonths: 60,
  amortizationPerMonth: 0,
  capexRate: 0,
  interestExpense: 0,
  effectiveTaxRate: 0,
  daysSalesOutstanding: 0,
  daysPayableOutstanding: 0,
  daysInventoryOutstanding: 0,
  projectionMonths: 24,
};

/** Receita inicial total (soma das três linhas de receita). */
export function initialRevenue(a: ScenarioAssumptions) {
  return a.initialProductRevenue + a.initialServiceRevenue + a.initialOtherRevenue;
}

/** Custo inicial estimado: custo fixo + custo variável sobre a receita inicial (a é fração). */
export function initialCost(a: ScenarioAssumptions) {
  return a.initialFixedCost + initialRevenue(a) * a.variableCostRate;
}

/** Crescimento médio da receita ponderado pelo peso de cada linha (fração). */
export function weightedRevenueGrowth(a: ScenarioAssumptions) {
  const total = initialRevenue(a);
  if (!total) return (a.productRevenueGrowth + a.serviceRevenueGrowth + a.otherRevenueGrowth) / 3;
  return (
    (a.initialProductRevenue * a.productRevenueGrowth +
      a.initialServiceRevenue * a.serviceRevenueGrowth +
      a.initialOtherRevenue * a.otherRevenueGrowth) /
    total
  );
}
