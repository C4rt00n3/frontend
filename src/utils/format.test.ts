import { describe, expect, it } from "vitest";
import { formatChange, formatMoneyCompact, formatPercent, formatRelative, initials, shortId } from "./format";

// Intl usa espaço não separável entre "R$" e o número.
const normalize = (s: string | null) => s?.replace(/\u00a0/g, " ");

describe("format", () => {
  it("formats compact money in pt-BR", () => {
    expect(normalize(formatMoneyCompact(1_470_000))).toBe("R$ 1,47 mi");
    expect(normalize(formatMoneyCompact(960_000))).toBe("R$ 960 mil");
    expect(normalize(formatMoneyCompact(-2_500_000))).toBe("−R$ 2,5 mi");
    expect(formatMoneyCompact(null)).toBe("—");
  });

  it("formats fractions as percentages", () => {
    expect(formatPercent(0.032)).toBe("3,2%");
    expect(formatPercent(0.462)).toBe("46,2%");
    expect(formatPercent(null)).toBe("—");
  });

  it("computes relative change against a reference", () => {
    expect(formatChange(1.578, 1)).toBe("+57,8%");
    expect(formatChange(50, 100)).toBe("−50%");
    expect(formatChange(10, 0)).toBeNull();
  });

  it("describes dates relative to now", () => {
    const now = new Date(2026, 10, 22, 15, 0);
    expect(formatRelative(new Date(2026, 10, 22, 10, 42).toISOString(), now)).toBe("Hoje, 10:42");
    expect(formatRelative(new Date(2026, 10, 21, 16, 20).toISOString(), now)).toBe("Ontem, 16:20");
  });

  it("builds initials and short ids", () => {
    expect(initials("Marina Costa Souza")).toBe("MS");
    expect(initials("ana")).toBe("AN");
    expect(shortId("6650f1c2a9b8e4d3c2b1a0ff")).toBe("#B1A0FF");
  });
});
