// Cores e estilos compartilhados pelos gráficos (alinhados ao CSS do design).
export const chartColors = {
  revenue: "#9c6cf7",
  cost: "#e18a4f",
  positive: "#4fc67a",
  negative: "#ef6b79",
  grid: "#2b2936",
  axis: "#5f5c6b",
  zero: "#777383",
};

/** Paleta para diferenciar cenários (comparação, cards). */
export const scenarioPalette = ["#8b5cf6", "#22c55e", "#f59e0b", "#38bdf8", "#f472b6", "#ef4444", "#a3e635", "#e2e8f0"];

export const scenarioColor = (index: number) => scenarioPalette[index % scenarioPalette.length];

export const axisProps = {
  stroke: chartColors.axis,
  tick: { fill: chartColors.axis, fontSize: 11, fontFamily: "Geist Mono, ui-monospace, monospace" },
  tickLine: false,
  axisLine: false,
} as const;

export const gridProps = {
  stroke: chartColors.grid,
  strokeDasharray: "3 4",
  vertical: false,
} as const;

export const tooltipProps = {
  contentStyle: {
    background: "#14131e",
    border: "1px solid #2e2c3a",
    borderRadius: 8,
    color: "#e6e3eb",
    fontSize: 12,
  },
  labelStyle: { color: "#9694a8", marginBottom: 4 },
  itemStyle: { padding: 0 },
  cursor: { stroke: "#3a3748", strokeWidth: 1 },
} as const;
