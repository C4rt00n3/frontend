import { z } from "zod";

// Valores em porcentagem no formulário; a conversão para fração acontece em utils/assumptions.
// Os limites espelham ScenarioAssumptionsDto (ex.: crescimento >= -100%, imposto entre 0 e 100%).
const number = (message = "Informe um número.") =>
  z.number({ invalid_type_error: message, required_error: message }).finite(message);

const money = number().min(0, "Não pode ser negativo.");
const growth = number().min(-100, "O mínimo é −100%.");
const rate = number().min(0, "Não pode ser negativo.");
const days = number().int("Use um número inteiro de dias.").min(0, "Não pode ser negativo.");

export const MAX_PROJECTION_MONTHS = 600;

export const scenarioSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome ao cenário.").max(120, "Use até 120 caracteres."),
  description: z.string().trim().max(1000, "Use até 1000 caracteres."),
  assumptions: z.object({
    initialProductRevenue: money,
    initialServiceRevenue: money,
    initialOtherRevenue: money,
    productRevenueGrowth: growth,
    serviceRevenueGrowth: growth,
    otherRevenueGrowth: growth,
    variableCostRate: rate,
    initialFixedCost: money,
    fixedCostGrowthRate: growth,
    initialInvestment: money,
    depreciableAssetValue: money,
    usefulLifeMonths: number().int("Use um número inteiro de meses.").min(1, "Use pelo menos 1 mês."),
    amortizationPerMonth: money,
    capexRate: rate,
    interestExpense: money,
    effectiveTaxRate: rate.max(100, "O máximo é 100%."),
    daysSalesOutstanding: days,
    daysPayableOutstanding: days,
    daysInventoryOutstanding: days,
    projectionMonths: number()
      .int("Use um número inteiro de meses.")
      .min(1, "Use pelo menos 1 mês.")
      .max(MAX_PROJECTION_MONTHS, `O máximo é ${MAX_PROJECTION_MONTHS} meses.`),
  }),
});

export type ScenarioValues = z.infer<typeof scenarioSchema>;
