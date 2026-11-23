import { describe, expect, it } from "vitest";
import { EMPTY_ASSUMPTIONS, initialCost, initialRevenue, toApiAssumptions, toFormAssumptions, weightedRevenueGrowth } from "./assumptions";

describe("assumptions conversion", () => {
  const form = {
    ...EMPTY_ASSUMPTIONS,
    initialProductRevenue: 91200,
    productRevenueGrowth: 3.2,
    variableCostRate: 30,
    effectiveTaxRate: 34,
    projectionMonths: 24,
  };

  it("converts percentages to fractions without floating point noise", () => {
    const api = toApiAssumptions(form);
    expect(api.productRevenueGrowth).toBe(0.032);
    expect(api.variableCostRate).toBe(0.3);
    expect(api.effectiveTaxRate).toBe(0.34);
    // Valores que não são taxas passam intactos.
    expect(api.initialProductRevenue).toBe(91200);
    expect(api.projectionMonths).toBe(24);
  });

  it("round-trips API values back to the form", () => {
    expect(toFormAssumptions(toApiAssumptions(form))).toEqual(form);
  });

  it("derives initial revenue, cost and weighted growth", () => {
    const a = {
      ...EMPTY_ASSUMPTIONS,
      initialProductRevenue: 1000,
      initialServiceRevenue: 3000,
      productRevenueGrowth: 0.1,
      serviceRevenueGrowth: 0.02,
      variableCostRate: 0.25,
      initialFixedCost: 500,
    };
    expect(initialRevenue(a)).toBe(4000);
    expect(initialCost(a)).toBe(1500);
    expect(weightedRevenueGrowth(a)).toBeCloseTo(0.04);
  });
});
